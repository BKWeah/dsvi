import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { supabase } from '@/integrations/supabase/client';
import { Bug, Database, Refresh, Save } from 'lucide-react';

export function EmailSettingsDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runDebug = async () => {
    setLoading(true);
    try {
      const debug = {
        timestamp: new Date().toISOString(),
        environment: {},
        database: {},
        service: {}
      };

      // Check environment
      debug.environment = {
        hasBrevoKey: !!import.meta.env.VITE_DEFAULT_BREVO_API_KEY,
        brevoKeyPreview: import.meta.env.VITE_DEFAULT_BREVO_API_KEY?.substring(0, 15) + '...',
        isDev: import.meta.env.DEV
      };

      // Check database directly
      try {
        const { data: allSettings, error } = await supabase
          .from('email_settings')
          .select('*')
          .order('created_at', { ascending: false });

        debug.database = {
          error: error?.message || null,
          totalRecords: allSettings?.length || 0,
          activeRecords: allSettings?.filter(s => s.is_active).length || 0,
          allSettings: allSettings?.map(s => ({
            id: s.id.substring(0, 8) + '...',
            provider: s.provider,
            from_email: s.from_email,
            is_active: s.is_active,
            created_at: s.created_at
          })) || []
        };
      } catch (dbError) {
        debug.database = {
          error: dbError instanceof Error ? dbError.message : 'Database access failed'
        };
      }

      // Check email service
      try {
        await emailService.initialize();
        const serviceSettings = emailService.getSettings();
        
        debug.service = {
          hasSettings: !!serviceSettings,
          hasConfig: !!emailService['config'],
          settings: serviceSettings ? {
            id: serviceSettings.id?.substring(0, 8) + '...',
            provider: serviceSettings.provider,
            from_email: serviceSettings.from_email,
            is_active: serviceSettings.is_active
          } : null
        };
      } catch (serviceError) {
        debug.service = {
          error: serviceError instanceof Error ? serviceError.message : 'Service check failed'
        };
      }

      setDebugInfo(debug);
      
    } catch (error) {
      console.error('Debug failed:', error);
      toast({
        title: "Debug Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllSettings = async () => {
    try {
      const { error } = await supabase
        .from('email_settings')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast({
        title: "Settings Cleared",
        description: "All email settings have been deactivated",
      });

      // Refresh debug info
      await runDebug();
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const saveTestSettings = async () => {
    try {
      const testSettings = {
        id: '',
        provider: 'brevo' as const,
        api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY || 'test-key',
        api_secret: null,
        smtp_host: null,
        smtp_port: null,
        smtp_username: null,
        smtp_password: null,
        from_email: 'test@dsvi.org',
        from_name: 'Test User',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await emailService.updateSettings(testSettings);

      toast({
        title: "Test Settings Saved",
        description: "Test email settings have been saved",
      });

      // Refresh debug info
      await runDebug();
    } catch (error) {
      console.error('Save test settings failed:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Email Settings Debug
        </CardTitle>
        <CardDescription>
          Debug email settings persistence issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} disabled={loading}>
            <Refresh className="h-4 w-4 mr-2" />
            {loading ? 'Running...' : 'Run Debug'}
          </Button>
          
          <Button onClick={saveTestSettings} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Test Settings
          </Button>
          
          <Button onClick={clearAllSettings} variant="destructive">
            <Database className="h-4 w-4 mr-2" />
            Clear All Settings
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="font-mono text-xs">
                <strong>Debug Report - {debugInfo.timestamp}</strong>
              </AlertDescription>
            </Alert>

            {/* Environment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Environment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>Has Brevo Key: {debugInfo.environment.hasBrevoKey ? 'Yes' : 'No'}</div>
                <div>Brevo Key: {debugInfo.environment.brevoKeyPreview}</div>
                <div>Development Mode: {debugInfo.environment.isDev ? 'Yes' : 'No'}</div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Database</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {debugInfo.database.error ? (
                  <div className="text-red-600">Error: {debugInfo.database.error}</div>
                ) : (
                  <>
                    <div>Total Records: {debugInfo.database.totalRecords}</div>
                    <div>Active Records: {debugInfo.database.activeRecords}</div>
                    {debugInfo.database.allSettings.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">All Settings:</div>
                        <div className="ml-2 space-y-1">
                          {debugInfo.database.allSettings.map((setting: any, i: number) => (
                            <div key={i} className={`text-xs p-2 rounded ${setting.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <div>ID: {setting.id}</div>
                              <div>Provider: {setting.provider}</div>
                              <div>Email: {setting.from_email}</div>
                              <div>Active: {setting.is_active ? 'Yes' : 'No'}</div>
                              <div>Created: {setting.created_at}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Service */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Email Service</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {debugInfo.service.error ? (
                  <div className="text-red-600">Error: {debugInfo.service.error}</div>
                ) : (
                  <>
                    <div>Has Settings: {debugInfo.service.hasSettings ? 'Yes' : 'No'}</div>
                    <div>Has Config: {debugInfo.service.hasConfig ? 'Yes' : 'No'}</div>
                    {debugInfo.service.settings && (
                      <div className="mt-2">
                        <div className="font-medium">Current Settings:</div>
                        <div className="ml-2 text-xs bg-blue-100 p-2 rounded">
                          <div>ID: {debugInfo.service.settings.id}</div>
                          <div>Provider: {debugInfo.service.settings.provider}</div>
                          <div>Email: {debugInfo.service.settings.from_email}</div>
                          <div>Active: {debugInfo.service.settings.is_active ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
