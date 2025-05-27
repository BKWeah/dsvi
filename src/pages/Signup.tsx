
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Check for school-specific signup parameters
  const schoolId = searchParams.get('school_id');
  const schoolName = searchParams.get('school_name');
  const inviteRole = searchParams.get('role');
  const isSchoolInvite = schoolId && schoolName && inviteRole === 'SCHOOL_ADMIN';

  useEffect(() => {
    if (isSchoolInvite) {
      setRole('SCHOOL_ADMIN');
    }
  }, [isSchoolInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({
        title: "Role required",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // For school admin invites, include school_id in metadata
    const metadata = isSchoolInvite ? { school_id: schoolId } : {};
    
    const { error } = await signup(email, password, role, metadata);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signup successful",
        description: isSchoolInvite 
          ? `Account created! You can now manage ${schoolName}.`
          : "Please check your email to verify your account.",
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
            {isSchoolInvite ? (
              <div className="flex items-center justify-center gap-2">
                <School className="h-6 w-6" />
                {schoolName}
              </div>
            ) : (
              'DSVI Platform'
            )}
          </CardTitle>
          <CardDescription>
            {isSchoolInvite 
              ? `Create your school administrator account for ${schoolName}`
              : 'Create your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSchoolInvite && (
            <Alert className="mb-4">
              <School className="h-4 w-4" />
              <AlertDescription>
                You're signing up as a School Administrator for <strong>{schoolName}</strong>.
                You'll be able to manage this school's website content.
              </AlertDescription>
            </Alert>
          )}
          
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
            {!isSchoolInvite && (
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DSVI_ADMIN">DSVI Admin</SelectItem>
                    <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
