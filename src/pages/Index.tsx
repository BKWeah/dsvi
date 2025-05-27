
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Digital School Visibility Initiative
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering schools with digital presence and content management solutions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {user ? (
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
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>For DSVI Staff</CardTitle>
                  <CardDescription>
                    Manage schools and oversee content across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Create and manage school profiles</li>
                    <li>Assign school administrators</li>
                    <li>Monitor content across all schools</li>
                    <li>Platform-wide analytics and reporting</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>For School Administrators</CardTitle>
                  <CardDescription>
                    Manage your school's website content and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Edit your school's website pages</li>
                    <li>Update admissions information</li>
                    <li>Manage faculty and academic content</li>
                    <li>Customize contact information</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Featured Schools
          </h2>
          <p className="text-gray-600">
            Public school websites will be displayed here once schools are created.
          </p>
        </div>
      </div>
    </div>
  );
}
