
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Check for school-specific signup parameters
  const schoolId = searchParams.get('school_id');
  const schoolName = searchParams.get('school_name');
  const inviteRole = searchParams.get('role');
  const isValidInvite = schoolId && schoolName && inviteRole === 'SCHOOL_ADMIN';

  // If no valid invite parameters, show unauthorized access
  if (!isValidInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              Account registration is invitation-only
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You can only create an account through an invitation link provided by a DSVI administrator.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For school admin invites, include school_id in metadata
    const metadata = { school_id: schoolId };
    
    const { error } = await signup(email, password, 'SCHOOL_ADMIN', metadata);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signup successful",
        description: `Account created! You can now manage ${schoolName}.`,
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center justify-center gap-2">
              <School className="h-6 w-6" />
              {schoolName}
            </div>
          </CardTitle>
          <CardDescription>
            Create your school administrator account for {schoolName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <School className="h-4 w-4" />
            <AlertDescription>
              You're signing up as a School Administrator for <strong>{schoolName}</strong>.
              You'll be able to manage this school's website content.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:underline"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
