import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function EmailPersistenceTest() {
  const [testValue, setTestValue] = useState('Test Save ' + Date.now());
  const [currentValue, setCurrentValue] = useState('');
  const [working, setWorking] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);
  const { toast } = useToast();

  const runFullTest = async () => {
    setWorking(true);
    setTestResult(null);
    
    try {
      console.log('🧪 PERSISTENCE TEST STARTED');
      
      // Step 1: Save test settings
      console.log('📝 Step 1: Saving test settings...');
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
        from_name: testValue, // This is what we're testing
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await emailService.updateSettings(testSettings);
      console.log('✅ Step 1 complete: Settings saved');

      // Step 2: Force reload from database
      console.log('🔄 Step 2: Reloading from database...');
      await emailService.reloadSettings();
      console.log('✅ Step 2 complete: Reload finished');

      // Step 3: Check if we get back what we saved
      console.log('🔍 Step 3: Checking loaded settings...');
      const loadedSettings = emailService.getSettings();
      
      if (loadedSettings && loadedSettings.from_name === testValue) {
        console.log('✅ SUCCESS: Loaded settings match saved settings!');
        setCurrentValue(loadedSettings.from_name);
        setTestResult('success');
        
        toast({
          title: "✅ Persistence Test PASSED!",
          description: `Successfully saved and loaded: "${testValue}"`,
        });
      } else {
        console.log('❌ FAILURE: Loaded settings do not match!');
        console.log('Expected:', testValue);
        console.log('Got:', loadedSettings?.from_name || 'null');
        setCurrentValue(loadedSettings?.from_name || 'null');
        setTestResult('failure');
        
        toast({
          title: "❌ Persistence Test FAILED!",
          description: `Expected "${testValue}" but got "${loadedSettings?.from_name || 'null'}"`,
          variant: "destructive",
        });
      }
      
      console.log('🧪 PERSISTENCE TEST COMPLETED');
      
    } catch (error) {
      console.error('💥 Persistence test failed:', error);
      setTestResult('failure');
      toast({
        title: "❌ Persistence Test ERROR!",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setWorking(false);
    }
  };

  const refreshTestValue = () => {
    setTestValue('Test Save ' + Date.now());
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {testResult === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {testResult === 'failure' && <AlertCircle className="h-5 w-5 text-red-500" />}
          Email Persistence Test
        </CardTitle>
        <CardDescription>
          Test the full save → reload → verify cycle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test Value to Save</Label>
          <div className="flex gap-2">
            <Input
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="Enter test value"
            />
            <Button onClick={refreshTestValue} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={runFullTest} 
          disabled={working}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {working ? 'Testing...' : 'Run Persistence Test'}
        </Button>

        {testResult && (
          <Alert className={testResult === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">
                  {testResult === 'success' ? '✅ Test PASSED!' : '❌ Test FAILED!'}
                </div>
                <div className="text-sm">
                  <div>Saved: "{testValue}"</div>
                  <div>Loaded: "{currentValue}"</div>
                  <div>Match: {testValue === currentValue ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-sm">
            <strong>This test:</strong>
            <br />1. Saves a unique test value to the database
            <br />2. Forces a reload from the database
            <br />3. Checks if the loaded value matches what was saved
            <br />4. Shows PASS/FAIL result
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
