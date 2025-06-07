import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BrevoService } from '@/lib/brevo-service';
import { TestTube, Send, CheckCircle, XCircle } from 'lucide-react';

export function BrevoTestComponent() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DEFAULT_BREVO_API_KEY || '');
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your Brevo API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setTesting(true);
      const brevoService = new BrevoService({
        api_key: apiKey,
        from_email: 'noreply@dsvi.org',
        from_name: 'DSVI Test',
        reply_to_email: 'support@dsvi.org'
      });

      const result = await brevoService.testConnection();
      setResults(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Brevo connection test successful!",
        });
      } else {
        toast({
          title: "Error",
          description: `Connection failed: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Error",
        description: "Test failed with an unexpected error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!apiKey || !testEmail) {
      toast({
        title: "Error", 
        description: "Please enter both API key and test email",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      const brevoService = new BrevoService({
        api_key: apiKey,
        from_email: 'noreply@dsvi.org', 
        from_name: 'DSVI Test',
        reply_to_email: 'support@dsvi.org'
      });

      const result = await brevoService.sendTestEmail(testEmail);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Test email sent successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: `Email sending failed: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Send test email failed:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Brevo Integration Test
        </CardTitle>
        <CardDescription>
          Test your Brevo API configuration and send test emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label>Brevo API Key</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="xkeysib-..."
          />
        </div>

        {/* Test Email Input */}
        <div className="space-y-2">
          <Label>Test Email Address</Label>
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={testing} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={sendTestEmail} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <Alert>
            <div className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {results.success 
                  ? 'Brevo connection successful!' 
                  : `Connection failed: ${results.error}`}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
