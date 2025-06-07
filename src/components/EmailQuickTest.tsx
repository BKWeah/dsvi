import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';

export function EmailQuickTest() {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testEmail = async () => {
    setTesting(true);
    try {
      // Initialize and test
      await emailService.initialize();
      const result = await emailService.testConnection();
      
      toast({
        title: result ? "✅ Email Test Passed!" : "❌ Email Test Failed",
        description: result ? 
          "Your email configuration is working correctly" : 
          "Check console for error details",
        variant: result ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Email test error:', error);
      toast({
        title: "❌ Email Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Quick Email Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={testEmail} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing Email...' : 'Test Email Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
