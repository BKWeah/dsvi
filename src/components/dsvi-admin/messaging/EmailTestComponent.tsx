import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { BrevoService } from '@/lib/brevo-service';
import { Mail, TestTube, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function EmailTestComponent() {
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const runFullDiagnostic = async () => {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      environment: {},
      cloudflareFunction: {},
      brevoConnection: {},
      emailService: {}
    };

    try {
      // 1. Check environment variables
      results.environment = {
        hasBrevoKey: !!import.meta.env.VITE_DEFAULT_BREVO_API_KEY,
        brevoKey: import.meta.env.VITE_DEFAULT_BREVO_API_KEY ? 
          `${import.meta.env.VITE_DEFAULT_BREVO_API_KEY.substring(0, 10)}...` : 'Not found',
        hasWorkerUrl: !!import.meta.env.VITE_BREVO_WORKER_URL,
        workerUrl: import.meta.env.VITE_BREVO_WORKER_URL || 'Using default /api/brevo',
        isDev: import.meta.env.DEV
      };

      // 2. Test Cloudflare Function availability
      try {
        const response = await fetch('/api/brevo/account', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_DEFAULT_BREVO_API_KEY || 'test'
          }
        });
        
        results.cloudflareFunction = {
          available: response.status !== 404,
          status: response.status,
          statusText: response.statusText,
          corsEnabled: response.headers.get('Access-Control-Allow-Origin') === '*'
        };

        if (response.ok) {
          const data = await response.json();
          results.cloudflareFunction.brevoResponse = data;
        } else {
          const errorText = await response.text();
          results.cloudflareFunction.error = errorText;
        }
      } catch (error) {
        results.cloudflareFunction = {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // 3. Test Brevo service directly
      if (import.meta.env.VITE_DEFAULT_BREVO_API_KEY) {
        try {
          const brevoService = new BrevoService({
            api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY,
            from_email: 'noreply@dsvi.org',
            from_name: 'DSVI Team'
          });
          
          const brevoTest = await brevoService.testConnection();
          results.brevoConnection = brevoTest;
          
          if (brevoTest.success) {
            const accountInfo = await brevoService.getAccountInfo();
            results.brevoConnection.accountInfo = accountInfo;
          }
        } catch (error) {
          results.brevoConnection = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // 4. Test email service
      try {
        await emailService.initialize();
        const serviceTest = await emailService.testConnection();
        results.emailService = {
          initialized: true,
          connectionTest: serviceTest,
          hasSettings: !!emailService.getSettings()
        };
      } catch (error) {
        results.emailService = {
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      setTestResults(results);
      
      toast({
        title: "Diagnostic Complete",
        description: "Check the results below for any issues",
      });

    } catch (error) {
      console.error('Diagnostic failed:', error);
      toast({
        title: "Diagnostic Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address for testing",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const brevoService = new BrevoService({
        api_key: import.meta.env.VITE_DEFAULT_BREVO_API_KEY!,
        from_email: 'noreply@dsvi.org',
        from_name: 'DSVI Team'
      });

      const result = await brevoService.sendTestEmail(testEmail);
      
      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: `Check ${testEmail} for the test email`,
        });
      } else {
        toast({
          title: "Test Email Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Email Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Email System Diagnostic
          </CardTitle>
          <CardDescription>
            Test your Brevo email integration and troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runFullDiagnostic} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Diagnostic complete. Review the results below to identify any issues.
                </AlertDescription>
              </Alert>

              {/* Environment Check */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <StatusIcon success={testResults.environment.hasBrevoKey} />
                    Environment Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>Brevo API Key: {testResults.environment.brevoKey}</div>
                  <div>Worker URL: {testResults.environment.workerUrl}</div>
                  <div>Development Mode: {testResults.environment.isDev ? 'Yes' : 'No'}</div>
                </CardContent>
              </Card>

              {/* Cloudflare Function Check */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <StatusIcon success={testResults.cloudflareFunction.available} />
                    Cloudflare Pages Function
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>Status: {testResults.cloudflareFunction.status} {testResults.cloudflareFunction.statusText}</div>
                  <div>CORS Enabled: {testResults.cloudflareFunction.corsEnabled ? 'Yes' : 'No'}</div>
                  {testResults.cloudflareFunction.error && (
                    <div className="text-red-600">Error: {testResults.cloudflareFunction.error}</div>
                  )}
                </CardContent>
              </Card>

              {/* Brevo Connection Check */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <StatusIcon success={testResults.brevoConnection.success} />
                    Brevo API Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  {testResults.brevoConnection.success ? (
                    <>
                      <div className="text-green-600">✓ Connected successfully</div>
                      {testResults.brevoConnection.accountInfo && (
                        <div>Account: {testResults.brevoConnection.accountInfo.email}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-red-600">✗ {testResults.brevoConnection.error}</div>
                  )}
                </CardContent>
              </Card>

              {/* Email Service Check */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <StatusIcon success={testResults.emailService.initialized && testResults.emailService.connectionTest} />
                    Email Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>Initialized: {testResults.emailService.initialized ? 'Yes' : 'No'}</div>
                  <div>Has Settings: {testResults.emailService.hasSettings ? 'Yes' : 'No'}</div>
                  <div>Connection Test: {testResults.emailService.connectionTest ? 'Pass' : 'Fail'}</div>
                  {testResults.emailService.error && (
                    <div className="text-red-600">Error: {testResults.emailService.error}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a real test email to verify everything is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Test Email Address</Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your-email@example.com"
            />
          </div>
          <Button 
            onClick={sendTestEmail} 
            disabled={testing || !testEmail || !import.meta.env.VITE_DEFAULT_BREVO_API_KEY}
            className="w-full"
          >
            {testing ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
