import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { simpleEmailService } from '@/lib/simple-email-service';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function EmailMessagingTest() {
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('DSVI Email System Test');
  const [testMessage, setTestMessage] = useState('This is a test message from the DSVI email system. If you receive this, the email messaging functionality is working correctly!');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const runEmailConnectionTest = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      // Test 1: Simple email service connection
      console.log('🔍 Testing email service connection...');
      const connectionTest = await simpleEmailService.testConnection();
      
      const results = {
        connectionTest: {
          success: connectionTest.success,
          error: connectionTest.error
        },
        apiEndpoint: '/api/email/send',
        timestamp: new Date().toISOString()
      };
      
      setTestResults(results);
      
      if (connectionTest.success) {
        toast({
          title: "✅ Email Connection Test Passed",
          description: "The email service is properly configured and ready to send messages",
        });
      } else {
        toast({
          title: "❌ Email Connection Test Failed", 
          description: connectionTest.error || "Email service connection failed",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Email connection test failed:', error);
      setTestResults({
        connectionTest: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      toast({
        title: "❌ Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testEmail || !testSubject || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending the test message",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    
    try {
      console.log('📧 Sending test message through messaging service...');
      
      // Send message through the messaging service (which should now call email service)
      const result = await messagingService.sendMessage({
        subject: testSubject,
        body: testMessage,
        message_type: 'email',
        recipients: {
          external_emails: [{
            email: testEmail,
            name: 'Test Recipient'
          }]
        }
      });

      console.log('📧 Messaging service result:', result);

      if (result.status === 'success') {
        toast({
          title: "✅ Test Message Sent!",
          description: `Message sent successfully to ${testEmail}. Check your inbox!`,
        });
        
        setTestResults(prev => ({
          ...prev,
          messageTest: {
            success: true,
            messageId: result.message_id,
            deliveryId: result.delivery_id,
            provider: result.delivery_provider,
            recipients: result.total_recipients
          }
        }));
      } else {
        toast({
          title: "❌ Message Sending Failed",
          description: result.errors ? result.errors.join(', ') : "Failed to send test message",
          variant: "destructive",
        });
        
        setTestResults(prev => ({
          ...prev,
          messageTest: {
            success: false,
            error: result.errors ? result.errors.join(', ') : "Sending failed"
          }
        }));
      }
      
    } catch (error) {
      console.error('Test message sending failed:', error);
      
      toast({
        title: "❌ Message Sending Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      setTestResults(prev => ({
        ...prev,
        messageTest: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }));
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email System Connection Test
          </CardTitle>
          <CardDescription>
            Test the email service connection without sending an actual email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runEmailConnectionTest} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Email Connection'
            )}
          </Button>
          
          {testResults?.connectionTest && (
            <Alert className={`mt-4 ${testResults.connectionTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <StatusIcon success={testResults.connectionTest.success} />
              <AlertDescription>
                <div className="font-medium">
                  {testResults.connectionTest.success ? 'Connection Test Passed' : 'Connection Test Failed'}
                </div>
                {testResults.connectionTest.error && (
                  <div className="text-sm mt-1">{testResults.connectionTest.error}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Message
          </CardTitle>
          <CardDescription>
            Send a real test email through the complete messaging system
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
          
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              placeholder="Test message subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message content"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={sendTestMessage} 
            disabled={testing || !testEmail}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Message...
              </>
            ) : (
              'Send Test Message'
            )}
          </Button>
          
          {testResults?.messageTest && (
            <Alert className={`${testResults.messageTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <StatusIcon success={testResults.messageTest.success} />
              <AlertDescription>
                <div className="font-medium">
                  {testResults.messageTest.success ? 'Message Sent Successfully' : 'Message Sending Failed'}
                </div>
                {testResults.messageTest.success && (
                  <div className="text-sm mt-1 space-y-1">
                    <div>Message ID: {testResults.messageTest.messageId}</div>
                    <div>Provider: {testResults.messageTest.provider}</div>
                    <div>Recipients: {testResults.messageTest.recipients}</div>
                  </div>
                )}
                {testResults.messageTest.error && (
                  <div className="text-sm mt-1">{testResults.messageTest.error}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>How this works:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Connection test verifies the email API endpoint is working</li>
            <li>Message test creates a database record and sends via Cloudflare Function</li>
            <li>Cloudflare Function uses Resend API to deliver the email</li>
            <li>Message status is updated in the database automatically</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
