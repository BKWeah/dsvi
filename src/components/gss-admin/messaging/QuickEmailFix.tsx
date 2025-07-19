import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { CheckCircle, AlertCircle, TestTube } from 'lucide-react';

export function QuickEmailFix() {
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testDefaultSettings = async () => {
    setTesting(true);
    try {
      const testSettings = {
        provider: 'brevo' as const,
        api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY,
        from_email: 'onboarding@libdsvi.com',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false
      };

      const connectionTest = await emailService.testConnection(testSettings);
      
      setResults({
        connectionTest,
        hasApiKey: !!import.meta.env.VITE_DEFAULT_BREVO_API_KEY,
        settings: testSettings
      });

      toast({
        title: connectionTest ? "Connection Test Passed!" : "Connection Test Failed",
        description: connectionTest ? 
          "Your Brevo configuration is working correctly" : 
          "There may be an issue with your API key or configuration",
        variant: connectionTest ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Test failed:', error);
      setResults({
        connectionTest: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveDefaultSettings = async () => {
    setSaving(true);
    try {
      const defaultSettings = {
        id: '',
        provider: 'brevo' as const,
        api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY || '',
        api_secret: null,
        smtp_host: null,
        smtp_port: null,
        smtp_username: null,
        smtp_password: null,
        from_email: 'onboarding@libdsvi.com',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await emailService.updateSettings(defaultSettings);
      
      toast({
        title: "Settings Saved!",
        description: "Default Brevo email settings have been saved successfully",
      });

      // Test the saved settings
      await testDefaultSettings();

    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Email Fix Verification
        </CardTitle>
        <CardDescription>
          Test and apply the Brevo email fix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDefaultSettings} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button onClick={saveDefaultSettings} disabled={saving || testing}>
            {saving ? 'Saving...' : 'Save Default Settings'}
          </Button>
        </div>

        {results && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {results.connectionTest ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                Connection Test: {results.connectionTest ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <div>Has API Key: {results.hasApiKey ? 'Yes' : 'No'}</div>
              {results.error && (
                <div className="text-red-600">Error: {results.error}</div>
              )}
              {results.settings && (
                <div>Provider: {results.settings.provider}</div>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
          <strong>What this does:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Tests your Brevo configuration without saving</li>
            <li>• Saves default Brevo settings to database</li>
            <li>• Verifies the database constraint fix is working</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
