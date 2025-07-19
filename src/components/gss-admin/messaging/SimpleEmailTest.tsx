import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { simpleEmailService } from '@/lib/simple-email-service';

export function SimpleEmailTest() {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; messageId?: string } | null>(null);

  const handleTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setResult({ success: false, error: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const testResult = await simpleEmailService.sendTestEmail(testEmail);
      setResult(testResult);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const connectionResult = await simpleEmailService.testConnection();
      setResult(connectionResult);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Simple Email Test
        </CardTitle>
        <CardDescription>
          Test the new simplified email implementation using Resend SMTP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-email" className="text-sm font-medium">
            Test Email Address
          </label>
          <Input
            id="test-email"
            type="email"
            placeholder="your@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTest} 
            disabled={isLoading || !testEmail}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Test Email
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleConnectionTest} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <AlertDescription className="mt-2">
              {result.success ? (
                <div>
                  <p className="font-medium text-green-800">Email sent successfully!</p>
                  {result.messageId && (
                    <p className="text-sm text-green-700 mt-1">
                      Message ID: {result.messageId}
                    </p>
                  )}
                  <p className="text-sm text-green-700 mt-1">
                    Check your inbox - the email should arrive within a few minutes.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-800">Email sending failed</p>
                  <p className="text-sm text-red-700 mt-1">{result.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📧 New Email System Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Direct Brevo SMTP integration</li>
            <li>• No CORS issues or complex fallbacks</li>
            <li>• Simple Cloudflare Pages Function</li>
            <li>• Easy to maintain and debug</li>
            <li>• Non-destructive integration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
