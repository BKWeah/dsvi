import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Eye, TestTube } from 'lucide-react';

export function EmailSettingsTracer() {
  const [fromName, setFromName] = useState('DSVI Team');
  const [fromEmail, setFromEmail] = useState('noreply@dsvi.org');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [traceLog, setTraceLog] = useState<string[]>([]);
  const { toast } = useToast();

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTraceLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setTraceLog([]);
  };

  const testSave = async () => {
    setSaving(true);
    clearLog();
    
    try {
      addToLog('🔄 Starting save test...');
      
      // Create test settings
      const testSettings = {
        id: '',
        provider: 'brevo' as const,
        api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY || 'test-key',
        api_secret: null,
        smtp_host: null,
        smtp_port: null,
        smtp_username: null,
        smtp_password: null,
        from_email: fromEmail,
        from_name: fromName,
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      addToLog(`📝 Saving: from_name="${fromName}", from_email="${fromEmail}"`);

      // Call the email service
      await emailService.updateSettings(testSettings);
      
      addToLog('✅ Save completed');
      
      toast({
        title: "Save Test Complete",
        description: "Check the trace log and browser console for details",
      });

    } catch (error) {
      addToLog(`❌ Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Save test failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const testLoad = async () => {
    setLoading(true);
    
    try {
      addToLog('🔄 Starting load test...');
      
      // Reinitialize the email service
      await emailService.initialize();
      
      // Get current settings
      const currentSettings = emailService.getSettings();
      
      if (currentSettings) {
        addToLog(`✅ Loaded: from_name="${currentSettings.from_name}", from_email="${currentSettings.from_email}"`);
        
        // Update form with loaded values
        setFromName(currentSettings.from_name);
        setFromEmail(currentSettings.from_email);
        
        toast({
          title: "Load Test Complete",
          description: `Loaded: ${currentSettings.from_name} <${currentSettings.from_email}>`,
        });
      } else {
        addToLog('⚠️ No settings found');
        toast({
          title: "Load Test Complete",
          description: "No settings found in database",
          variant: "destructive",
        });
      }

    } catch (error) {
      addToLog(`❌ Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Load test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    try {
      addToLog('🔄 Checking database directly...');
      
      const { data: allSettings, error } = await supabase
        .from('email_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        addToLog(`❌ Database error: ${error.message}`);
        return;
      }

      addToLog(`📊 Total records: ${allSettings?.length || 0}`);
      
      if (allSettings && allSettings.length > 0) {
        allSettings.forEach((setting, index) => {
          const isActive = setting.is_active ? '🟢' : '🔴';
          addToLog(`   ${isActive} Record ${index + 1}: "${setting.from_name}" <${setting.from_email}> (${setting.is_active ? 'ACTIVE' : 'inactive'})`);
        });
      }

    } catch (error) {
      addToLog(`❌ Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Email Settings Tracer
        </CardTitle>
        <CardDescription>
          Test save/load operations with detailed tracing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Form */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="DSVI Team"
            />
          </div>
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@dsvi.org"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={testSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Test Save'}
          </Button>
          
          <Button onClick={testLoad} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Test Load'}
          </Button>
          
          <Button onClick={checkDatabase} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Check Database
          </Button>
          
          <Button onClick={clearLog} variant="ghost">
            Clear Log
          </Button>
        </div>

        {/* Trace Log */}
        {traceLog.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                <div className="font-medium mb-2">Trace Log:</div>
                {traceLog.map((log, index) => (
                  <div key={index} className="text-xs font-mono bg-gray-100 p-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-sm">
            <strong>How to use:</strong>
            <br />1. Change the "From Name" to something unique (e.g., "Test 123")
            <br />2. Click "Test Save" and watch the trace log
            <br />3. Click "Test Load" to see if it loads back correctly
            <br />4. Check browser console for detailed logs
            <br />5. Click "Check Database" to see what's actually stored
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
