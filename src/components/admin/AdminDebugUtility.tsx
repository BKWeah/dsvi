import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminDebugUtility() {
  const { user } = useAuth();
  const { adminLevel, refreshAdminData } = useAdmin();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get admin level using new consolidated function
      const { data: levelData, error: levelError } = await supabase
        .rpc('get_admin_level_new', { p_user_id: user.id });
      
      // Get admin profile using new consolidated function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_admin_by_user_id', { p_user_id: user.id });

      // Get admin data directly from consolidated table
      const { data: directData, error: directError } = await supabase
        .from('dsvi_admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDebugInfo({
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        dbAdminLevel: { data: levelData, error: levelError },
        dbProfile: { data: profileData, error: profileError },
        directConsolidatedData: { data: directData, error: directError },
        hookAdminLevel: adminLevel,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Debug Utility (Consolidated dsvi_admin Table)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebugCheck} disabled={loading}>
            {loading ? 'Checking...' : 'Run Debug Check'}
          </Button>
          <Button onClick={refreshAdminData} variant="outline">
            Refresh Admin Data
          </Button>
        </div>

        {user && (
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <Badge>{user.user_metadata?.role || 'None'}</Badge></p>
            <p><strong>Current Admin Level:</strong> 
              {adminLevel ? <Badge variant="default">Level {adminLevel}</Badge> : <Badge variant="secondary">None</Badge>}
            </p>
          </div>
        )}

        {debugInfo && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
