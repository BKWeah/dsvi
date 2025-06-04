import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminMigrationUtility() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const migrateAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('migrate_existing_dsvi_admins');
      if (error) throw error;
      
      const migrated = data?.filter((r: any) => r.migrated).length || 0;
      setMessage(`Successfully migrated ${migrated} admin(s) to Level 1`);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Migration Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={migrateAdmins} disabled={loading}>
          {loading ? 'Migrating...' : 'Migrate Existing DSVI Admins to Level 1'}
        </Button>
        
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
