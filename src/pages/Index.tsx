import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewHomePage } from './public/NewHomePage';

export default function Index() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Navigate to home page after logout
  };
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
              <CardDescription>
                You are logged in as: {user.email} ({role})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {role === 'DSVI_ADMIN' && (
                  <Button asChild>
                    <Link to="/dsvi-admin">DSVI Admin Panel</Link>
                  </Button>
                )}
                {role === 'SCHOOL_ADMIN' && (
                  <Button asChild>
                    <Link to="/school-admin">School Admin Panel</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show the new beautiful landing page for non-authenticated users
  return <NewHomePage />;
}
