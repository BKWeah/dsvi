import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BrevoService } from '@/lib/brevo-service';
import { CheckCircle, AlertCircle, TestTube } from 'lucide-react';

export function SimpleEmailTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testEmailDirect = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      // Test directly without database dependency
      const apiKey = import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
      
      if (!apiKey) {
        throw new Error('No Brevo API key found in environment variables');
      }

      // Create Brevo service instance
      const brevoService = new BrevoService({
        api_key: apiKey,
        from_email: 'onboarding@libdsvi.com',
        from_name: 'DSVI Team'
      });

      // Test connection
      const connectionResult = await brevoService.testConnection();
      
      setResult({
        success: connectionResult.success,
        error: connectionResult.error,
        apiKey: `${apiKey.substring(0, 10)}...`,
        hasApiKey: !!apiKey
      });

      toast({
        title: connectionResult.success ? "✅ Email Test Passed!" : "❌ Email Test Failed",
        description: connectionResult.success ? 
          "Your Brevo configuration is working!" : 
          connectionResult.error || "Unknown error",
        variant: connectionResult.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Email test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setResult({
        success: false,
        error: errorMessage,
        hasApiKey: !!import.meta.env.VITE_DEFAULT_BREVO_API_KEY
      });

      toast({
        title: "❌ Email Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Simple Email Test
        </CardTitle>
        <CardDescription>
          Direct test without database dependency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testEmailDirect} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing Email...' : 'Test Email Configuration'}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <AlertDescription className="font-medium">
                  {result.success ? 'Email Test Successful!' : 'Email Test Failed'}
                </AlertDescription>
                {result.error && (
                  <AlertDescription className="text-sm">
                    {result.error}
                  </AlertDescription>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Has API Key: {result.hasApiKey ? 'Yes' : 'No'}</div>
                  {result.apiKey && <div>API Key: {result.apiKey}</div>}
                  <div>Environment: {import.meta.env.DEV ? 'Development' : 'Production'}</div>
                </div>
              </div>
            </div>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> This test bypasses the database and tests your email configuration directly. 
            It's perfect for development and troubleshooting.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
