import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Crown, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  details?: string;
}

export default function AdminLevelTestPage() {
  const { user, role, adminLevel } = useAuth();
  const { 
    isLevel1Admin, 
    isLevel2Admin, 
    hasPermission, 
    hasSchoolAccess,
    loading 
  } = useAdmin();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    if (!user) return;

    setTesting(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Admin level detection
      results.push({
        test: 'Admin Level Detection',
        status: adminLevel ? 'pass' : 'fail',
        details: `Admin level: ${adminLevel || 'none'}`
      });

      // Test 2: RPC function call
      try {
        const { data, error } = await supabase.rpc('get_admin_level', { user_id: user.id });
        results.push({
          test: 'Database RPC Call',
          status: !error ? 'pass' : 'fail',
          details: error ? error.message : `Level: ${data}`
        });
      } catch (error) {
        results.push({
          test: 'Database RPC Call',
          status: 'fail',
          details: 'RPC function failed'
        });
      }

      // Test 3: Permission checking
      const hasContentPermission = hasPermission('content_management');
      results.push({
        test: 'Permission Checking',
        status: isLevel1Admin || hasContentPermission ? 'pass' : 'pending',
        details: `Content management permission: ${hasContentPermission}`
      });

      // Test 4: School access (if applicable)
      if (isLevel2Admin) {
        const testSchoolId = 'test-school-id';
        const hasAccess = hasSchoolAccess(testSchoolId);
        results.push({
          test: 'School Access Check',
          status: 'pending',
          details: `Test school access: ${hasAccess}`
        });
      }

      // Test 5: Profile creation (Level 1 only)
      if (isLevel1Admin) {
        results.push({
          test: 'Level 1 Admin Features',
          status: 'pass',
          details: 'Can access admin management'
        });
      }

    } catch (error) {
      results.push({
        test: 'General Testing',
        status: 'fail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading admin data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Admin Level System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Current User</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Role: {role}</p>
            </div>
            <div>
              <h3 className="font-medium">Admin Status</h3>
              {isLevel1Admin && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Level 1 (Super Admin)
                </Badge>
              )}
              {isLevel2Admin && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Level 2 (Assigned Staff)
                </Badge>
              )}
              {!isLevel1Admin && !isLevel2Admin && (
                <Badge variant="outline">No Admin Level</Badge>
              )}
            </div>
          </div>

          <Button onClick={runTests} disabled={testing}>
            {testing ? 'Running Tests...' : 'Run Admin Level Tests'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{result.test}</h4>
                    {result.details && (
                      <p className="text-sm text-muted-foreground">{result.details}</p>
                    )}
                  </div>
                  <div>
                    {result.status === 'pass' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pass
                      </Badge>
                    )}
                    {result.status === 'fail' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Fail
                      </Badge>
                    )}
                    {result.status === 'pending' && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
