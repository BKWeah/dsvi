import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // Added supabase import
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

export default function Level2AdminSignupPage() {
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract parameters from URL - support both old and new formats
  const inviteToken = searchParams.get('token');
  const emailHash = searchParams.get('eh'); // New secure format
  const encodedEmail = searchParams.get('email'); // Old format (backward compatibility)
  const tempPassword = searchParams.get('pwd');
  const adminName = searchParams.get('name');

  // Decode the email parameter properly
  let directEmail = '';
  if (encodedEmail) {
    try {
      // First try URL decoding
      directEmail = decodeURIComponent(encodedEmail);
      
      // If it looks like base64 (no @ symbol and reasonable length), try base64 decode
      if (!directEmail.includes('@') && directEmail.length > 4) {
        try {
          directEmail = atob(directEmail);
          console.log('Successfully decoded base64 email:', directEmail);
        } catch (base64Error) {
          console.warn('Base64 decode failed, using URL decoded version:', directEmail);
        }
      }
    } catch (error) {
      console.error('Error decoding email parameter:', error);
      directEmail = encodedEmail; // Fallback to raw parameter
    }
  }

  console.log('Signup page parameters:', {
    inviteToken,
    emailHash,
    encodedEmail,
    directEmail,
    tempPassword,
    adminName
  });

  // Add debug information about localStorage
  try {
    const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
    console.log('Available pending invitations:', pendingAdmins.map(admin => ({
      email: admin.email,
      token: admin.inviteToken,
      emailHash: admin.emailHash
    })));
  } catch (e) {
    console.log('No pending invitations found');
  }

  // Get the actual email from localStorage using the hash or direct email
  const [inviteData, setInviteData] = useState<any>(null);
  const [obscuredEmail, setObscuredEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isInvitationLoading, setIsInvitationLoading] = useState(true);
  const [invitationErrorState, setInvitationErrorState] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      setIsInvitationLoading(true);
      setInvitationErrorState(null);
      setInviteData(null);

      if (!inviteToken) {
        setInvitationErrorState('Invitation token is missing from the URL.');
        setIsInvitationLoading(false);
        return;
      }

      try {
        console.log('Fetching invitation from database with token:', inviteToken);
        console.log('Fetching invitation from database with token:', inviteToken);
        // Temporarily cast the function name to 'any' to bypass TypeScript's strict type checking for RPC function names.
        // This is a workaround if the generated types or Supabase client's RPC method inference is not working as expected.
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_invitation_by_token' as any, {
          p_invite_token: inviteToken
        });

        if (rpcError) {
          console.error('Error calling get_invitation_by_token RPC:', rpcError);
          setInvitationErrorState(`Failed to fetch invitation: ${rpcError.message}`);
          return;
        }

        // Explicitly type rpcResult to InvitationRpcResult for type safety
        const typedRpcResult: InvitationRpcResult | null = rpcResult;

        if (!typedRpcResult?.success) {
          console.warn('Invitation not found or invalid:', typedRpcResult?.message);
          setInvitationErrorState(typedRpcResult?.message || 'Invitation not found, expired, or already used.');
          return;
        }

        const invitation = typedRpcResult.invitation;
        console.log('Successfully fetched invitation:', invitation);

        setInviteData(invitation);
        setEmail(invitation.email); // Pre-fill email from invitation
        setPassword(tempPassword || invitation.temp_password || ''); // Use URL temp_password first, then DB temp_password

        // Create obscured email (show first 2 chars + last domain)
        const [localPart, domain] = invitation.email.split('@');
        const obscured = `${localPart.substring(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}@${domain}`;
        setObscuredEmail(obscured);
        setEmailConfirmed(true); // Email is confirmed if fetched from DB

      } catch (error: any) {
        console.error('Unexpected error fetching invitation:', error);
        setInvitationErrorState(`An unexpected error occurred: ${error.message}`);
      } finally {
        setIsInvitationLoading(false);
      }
    };

    fetchInvitation();
  }, [inviteToken, tempPassword]); // Depend on inviteToken and tempPassword from URL

  // Validate email matches the invitation (only if not pre-filled and confirmed)
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (inviteData) {
      setEmailConfirmed(value.toLowerCase() === inviteData.email.toLowerCase());
    }
  };

  // Handle signup process
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
      const { error } = await signup(email, password, 'DSVI_ADMIN', {
        name: inviteData?.name || adminName || email.split('@')[0],
        inviteToken: inviteToken, // This helps identify it as a Level 2 admin signup
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created Successfully!",
        description: "You can now login with your Level 2 admin account.",
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if invitation is valid (support both formats)
  const hasValidParams = (inviteToken || tempPassword) && (emailHash || directEmail);
  const hasInviteData = inviteData !== null;

  console.log('Invitation validation:', {
    hasValidParams,
    hasInviteData,
    inviteToken: !!inviteToken,
    tempPassword: !!tempPassword,
    emailHash: !!emailHash,
    directEmail: !!directEmail,
    inviteData: !!inviteData
  });

  if (!hasValidParams || !hasInviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired.
            </p>
            <div className="text-xs text-left bg-gray-50 p-3 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>Has valid params: {hasValidParams ? 'Yes' : 'No'}</p>
              <p>Has invite data: {hasInviteData ? 'Yes' : 'No'}</p>
              <p>Token: {inviteToken ? 'Present' : 'Missing'}</p>
              <p>Email: {directEmail ? 'Present' : 'Missing'}</p>
              <p>Password: {tempPassword ? 'Present' : 'Missing'}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for a new invitation.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Back to Admin Planet</Link>
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
                  <strong>Admin Name:</strong> {inviteData?.name || adminName || email.split('@')[0]}
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
