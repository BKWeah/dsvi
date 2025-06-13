import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

// Define the expected structure of the RPC result for get_invitation_by_token
interface InvitationRpcResult {
  success: boolean;
  message?: string;
  error?: string;
  invitation?: {
    id: string;
    email: string;
    name: string;
    invite_token: string;
    email_hash: string;
    temp_password: string;
    admin_level: number;
    permissions: string[] | null;
    school_ids: string[] | null;
    notes: string | null;
    created_by: string;
    created_at: string;
    expires_at: string;
    is_used: boolean;
    used_at: string | null;
    used_by: string | null;
    signup_link: string | null;
  };
}

// Define the expected structure of the RPC result for create_admin_from_invitation
interface CreateAdminRpcResult {
  success: boolean;
  message?: string;
  error?: string;
  admin_id?: string;
}

export default function Level2AdminSignupPage() {
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract parameters from URL
  const inviteToken = searchParams.get('token');
  const emailHash = searchParams.get('eh');
  const tempPassword = searchParams.get('pwd');
  const adminName = searchParams.get('name');

  console.log('🔄 Signup page parameters:', {
    inviteToken,
    emailHash,
    tempPassword,
    adminName
  });

  // State variables
  const [inviteData, setInviteData] = useState<any>(null);
  const [obscuredEmail, setObscuredEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isInvitationLoading, setIsInvitationLoading] = useState(true);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      setIsInvitationLoading(true);
      setInvitationError(null);
      setInviteData(null);

      if (!inviteToken) {
        setInvitationError('Invitation token is missing from the URL.');
        setIsInvitationLoading(false);
        return;
      }

      try {
        console.log('🔄 Fetching invitation from database with token:', inviteToken);

        // Decode the base64 token to get the raw token for database lookup
        let decodedToken = inviteToken;
        try {
          decodedToken = atob(inviteToken || '');
          console.log('🔍 Decoded token:', decodedToken);
        } catch (decodeError) {
          console.log('⚠️ Token decode failed, using raw token:', inviteToken);
          decodedToken = inviteToken || '';
        }

        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_invitation_by_token' as any, {
          p_invite_token: decodedToken // Use decoded token for database lookup
        });

        if (rpcError) {
          console.error('❌ Error calling get_invitation_by_token RPC:', rpcError);
          setInvitationError(`Failed to fetch invitation: ${rpcError.message}`);
          return;
        }

        const typedRpcResult: InvitationRpcResult | null = rpcResult;

        if (!typedRpcResult?.success) {
          console.warn('❌ Invitation not found or invalid:', typedRpcResult?.message);
          setInvitationError(typedRpcResult?.message || 'Invitation not found, expired, or already used.');
          return;
        }

        const invitation = typedRpcResult.invitation;
        console.log('✅ Successfully fetched invitation:', invitation);

        setInviteData(invitation);
        setEmail(invitation.email);
        setPassword(tempPassword || invitation.temp_password || '');

        // Create obscured email (show first 2 chars + last domain)
        const [localPart, domain] = invitation.email.split('@');
        const obscured = `${localPart.substring(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}@${domain}`;
        setObscuredEmail(obscured);
        setEmailConfirmed(true);

      } catch (error: any) {
        console.error('❌ Unexpected error fetching invitation:', error);
        setInvitationError(`An unexpected error occurred: ${error.message}`);
      } finally {
        setIsInvitationLoading(false);
      }
    };

    fetchInvitation();
  }, [inviteToken, tempPassword]);

  // Validate email matches the invitation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (inviteData) {
      setEmailConfirmed(value.toLowerCase() === inviteData.email.toLowerCase());
    }
  };

  // Handle signup process with new consolidated admin creation
  const handleSignup = async () => {
    if (!emailConfirmed) {
      toast({
        title: "Email Mismatch",
        description: "Please enter the exact email address that was invited.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Starting Level 2 admin signup process...');

      // Decode the invite token for database operations
      let decodedInviteToken = inviteToken;
      try {
        decodedInviteToken = atob(inviteToken || '');
        console.log('🔍 Using decoded token for signup:', decodedInviteToken);
      } catch (decodeError) {
        console.log('⚠️ Token decode failed, using raw token');
        decodedInviteToken = inviteToken || '';
      }

      // Step 1: Create auth user (handle existing users)
      let authData, authError;
      
      const signupResult = await signup(email, password, 'DSVI_ADMIN', {
        name: inviteData?.name || adminName || email.split('@')[0],
        inviteToken: decodedInviteToken, // Use decoded token
        skipAutoAdminCreation: true // Prevent automatic Level 1 admin creation
      });
      
      authData = signupResult.data;
      authError = signupResult.error;

      // Check if user already exists - this might be OK if admin record gets created via AuthContext
      if (authError && authError.message?.includes('User already registered')) {
        console.log('ℹ️ User already exists - checking if admin record was created...');
        
        // Wait a moment for AuthContext to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if admin record was created by AuthContext
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser?.user) {
          console.log('✅ User is authenticated, checking admin record...');
          
          // Check if admin record exists
          const { data: adminCheck } = await supabase
            .from('dsvi_admins')
            .select('id, admin_level')
            .eq('user_id', currentUser.user.id)
            .single();
            
          if (adminCheck && adminCheck.admin_level === 2) {
            console.log('✅ Level 2 admin record found - signup completed via AuthContext!');
            
            toast({
              title: "Account Ready!",
              description: `Welcome ${inviteData?.name}! Your Level 2 admin account is ready.`,
            });
            
            // Dispatch event and redirect
            window.dispatchEvent(new CustomEvent('adminLevelChanged'));
            setTimeout(() => {
              navigate('/login?message=signup-success');
            }, 2000);
            return; // Exit early - everything is done!
          }
        }
        
        // If we get here, try to sign in the existing user manually
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
        if (signInError || !signInData.user) {
          throw new Error('User already exists but cannot authenticate. Please check your password.');
        }
        
        console.log('✅ Manually authenticated existing user:', signInData.user.id);
        authData = signInData;
        authError = null;
      } else if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw authError;
      }

      console.log('✅ Auth user ready:', authData?.user?.id);

      // Verify we have a valid user (if not, it might have been handled by AuthContext)
      if (!authData?.user?.id) {
        console.log('⚠️ No user ID from signup - checking if user is already authenticated...');
        
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser?.user) {
          console.log('✅ User is already authenticated:', currentUser.user.id);
          authData = { user: currentUser.user };
        } else {
          console.error('❌ No authenticated user found');
          throw new Error('Authentication failed - no user found');
        }
      }

      // Step 2: Check if admin record was already created by AuthContext
      console.log('🔄 Checking if Level 2 admin record already exists...');
      
      const { data: existingAdmin } = await supabase
        .from('dsvi_admins')
        .select('id, admin_level, invite_token')
        .eq('user_id', authData.user.id)
        .single();
        
      if (existingAdmin && existingAdmin.admin_level === 2) {
        console.log('✅ Level 2 admin record already exists - created by AuthContext!');
        console.log('✅ Admin ID:', existingAdmin.id);
        
        toast({
          title: "Account Ready!",
          description: `Welcome ${inviteData?.name}! Your Level 2 admin account is ready.`,
        });
        
        // Dispatch event and redirect
        window.dispatchEvent(new CustomEvent('adminLevelChanged'));
        setTimeout(() => {
          navigate('/login?message=signup-success');
        }, 2000);
        return; // Exit - everything is already done!
      }

      // Step 3: If no admin record exists, create it directly
      console.log('🔄 No existing admin record found - creating Level 2 admin record DIRECTLY...');

      const { data: adminResult, error: adminError } = await supabase.rpc('signup_level2_admin_directly', {
        p_user_id: authData.user.id,
        p_email: email,  // Use actual email entered by user
        p_name: inviteData?.name || adminName || email.split('@')[0],
        p_invite_token: decodedInviteToken
      });

      console.log('📊 Admin creation result:', adminResult);

      if (adminError) {
        console.error('❌ Error creating admin from invitation:', adminError);
        throw new Error(`Failed to create admin profile: ${adminError.message}`);
      }

      const typedAdminResult: CreateAdminRpcResult | null = adminResult;

      if (!typedAdminResult?.success) {
        console.error('❌ Admin creation failed:', typedAdminResult?.message);
        throw new Error(typedAdminResult?.message || 'Failed to create admin profile');
      }

      console.log('✅ Admin record created successfully:', typedAdminResult.admin_id);

      // Step 4: Dispatch admin level change event for UI updates
      console.log('🔄 Dispatching admin level change event...');
      window.dispatchEvent(new CustomEvent('adminLevelChanged'));

      toast({
        title: "Account Ready!",
        description: `Welcome ${inviteData?.name}! Your Level 2 admin account has been set up successfully.`,
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/login?message=signup-success');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state for invitation fetch
  if (isInvitationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state for invalid invitation
  if (invitationError || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {invitationError || 'This invitation link is invalid or has expired.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for a new invitation.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <CardTitle>Level 2 Admin Signup</CardTitle>
          <CardDescription>
            Complete your Level 2 (Assigned Staff) admin account setup
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Email Confirmation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Confirm Your Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={emailConfirmed ? 'border-green-500' : email ? 'border-red-500' : ''}
              />
              {email && (
                <div className="flex items-center gap-2 text-sm">
                  {emailConfirmed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Email confirmed</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Email must match invitation</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter the exact email address that was invited: <strong>{obscuredEmail}</strong>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 2: Password Setup (shown when email is confirmed) */}
          {emailConfirmed && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can use the pre-filled temporary password or create your own (min. 6 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Account Type:</strong> DSVI Admin (Level 2 - Assigned Staff)<br />
                  <strong>Admin Name:</strong> {inviteData?.name}<br />
                  <strong>Permissions:</strong> {inviteData?.permissions?.length || 0} assigned<br />
                  <strong>Schools:</strong> {inviteData?.school_ids?.length || 0} assigned
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSignup} 
                className="w-full" 
                disabled={isLoading || password !== confirmPassword || password.length < 6}
              >
                {isLoading ? 'Creating Account...' : 'Create Level 2 Admin Account'}
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
