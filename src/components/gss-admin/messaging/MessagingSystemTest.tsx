import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { simpleEmailService } from '@/lib/simple-email-service';
import { automatedMessagingService } from '@/lib/automated-messaging-service';
import { CheckCircle, AlertCircle, TestTube, Mail, MessageSquare, Zap } from 'lucide-react';

export function MessagingSystemTest() {
  const [testResults, setTestResults] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    
    try {
      await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
    }
  };

  const testEmailSettings = async () => {
    // Test the new simple email service functionality
    const testResult = await simpleEmailService.testConnection();
    if (!testResult.success) {
      throw new Error(testResult.error || 'SMTP email connection test failed');
    }
  };

  const testMessagingService = async () => {
    // Test basic messaging service functions
    const templates = await messagingService.getActiveTemplates();
    const stats = await messagingService.getStats();
    const accessibleSchools = await messagingService.getAccessibleSchools();
    
    if (!Array.isArray(templates)) {
      throw new Error('Failed to get templates');
    }
    
    if (typeof stats.total_messages !== 'number') {
      throw new Error('Failed to get messaging stats');
    }
    
    if (!Array.isArray(accessibleSchools)) {
      throw new Error('Failed to get accessible schools');
    }
  };

  const testTemplateSystem = async () => {
    // Test template creation and management
    const testTemplate = {
      name: `Test Template ${Date.now()}`,
      subject: 'Test Subject',
      body: 'Test body with {{variable}}',
      template_type: 'custom' as const,
      variables: ['variable']
    };
    
    const created = await messagingService.createTemplate(testTemplate);
    if (!created.id) {
      throw new Error('Failed to create template');
    }
    
    // Clean up - delete the test template
    await messagingService.deleteTemplate(created.id);
  };

  const testAutomatedMessaging = async () => {
    // Test automated messaging functionality
    const processedCount = await automatedMessagingService.processAutomatedMessages();
    // Should complete without error (even if 0 messages processed)
    if (typeof processedCount !== 'number') {
      throw new Error('Automated messaging returned invalid result');
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      await runTest('Email Settings', testEmailSettings);
      await runTest('Messaging Service', testMessagingService);
      await runTest('Template System', testTemplateSystem);
      await runTest('Automated Messaging', testAutomatedMessaging);
      
      toast({
        title: "Tests Completed",
        description: "All messaging system tests have been executed",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Some tests failed to execute",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const tests = [
    { key: 'Email Settings', icon: Mail, description: 'SMTP email configuration and connection test' },
    { key: 'Messaging Service', icon: MessageSquare, description: 'Core messaging functionality' },
    { key: 'Template System', icon: TestTube, description: 'Template creation and management' },
    { key: 'Automated Messaging', icon: Zap, description: 'Automated message processing' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-6 w-6" />
          Messaging System Test
        </CardTitle>
        <CardDescription>
          Test SMTP email service and messaging system components to ensure they are working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {tests.map((test) => {
            const Icon = test.icon;
            const status = testResults[test.key];
            
            return (
              <div key={test.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{test.key}</div>
                    <div className="text-sm text-muted-foreground">{test.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">
                    {status === 'success' && 'Passed'}
                    {status === 'error' && 'Failed'}
                    {status === 'pending' && 'Running...'}
                    {!status && 'Ready'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          onClick={runAllTests} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        
        <div className="text-sm text-muted-foreground text-center">
          This test verifies that the SMTP email service and messaging system components are properly configured and functional.
        </div>
      </CardContent>
    </Card>
  );
}
