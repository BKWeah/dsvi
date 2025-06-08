import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  History, 
  Settings,
  Plus,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { emailService } from '@/lib/email-service';
import { MessagingStats, Message, MessageTemplate } from '@/lib/messaging-types';
import { ComposeMessageDialog } from '@/components/dsvi-admin/messaging/ComposeMessageDialog';
import { TemplateManagerDialog } from '@/components/dsvi-admin/messaging/TemplateManagerDialog';
import { MessageHistoryTable } from '@/components/dsvi-admin/messaging/MessageHistoryTable';
import { EmailSettingsDialog } from '@/components/dsvi-admin/messaging/EmailSettingsDialog';
import { QuickEmailSettings } from '@/components/dsvi-admin/messaging/QuickEmailSettings';
import { SimpleEmailTest } from '@/components/dsvi-admin/messaging/SimpleEmailTest';
import { MessagingSystemTest } from '@/components/dsvi-admin/messaging/MessagingSystemTest';
import { TemplateDebugger } from '@/components/dsvi-admin/messaging/TemplateDebugger';

export default function MessagingPanelPage() {
  // No-op change to trigger recompile
  const [stats, setStats] = useState<MessagingStats>({
    total_messages: 0,
    sent_messages: 0,
    pending_messages: 0,
    failed_messages: 0,
    total_templates: 0,
    active_templates: 0
  });
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ensure default templates exist
      await messagingService.createDefaultTemplates();
      
      // Fetch all data in parallel
      const [statsData, messagesData, templatesData] = await Promise.all([
        messagingService.getStats(),
        messagingService.getMessages(10, 0),
        messagingService.getActiveTemplates()
      ]);

      console.log('Fetched templates:', templatesData);
      
      setStats(statsData);
      setRecentMessages(messagesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to fetch messaging data:', error);
      toast({
        title: "Error",
        description: "Failed to load messaging data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleMessageSent = () => {
    fetchData();
    setShowComposeDialog(false);
    toast({
      title: "Success",
      description: "Message sent successfully",
    });
  };

  const handleTemplateCreated = () => {
    fetchData();
    setShowTemplateDialog(false);
    toast({
      title: "Success",
      description: "Template created successfully",
    });
  };

  const testEmailConnection = async () => {
    try {
      const isConnected = await emailService.testConnection();
      
      if (isConnected) {
        toast({
          title: "Success",
          description: "Email connection test successful",
        });
      } else {
        toast({
          title: "Error",
          description: "Email connection test failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test email connection",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messaging Center</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messaging Center</h1>
          <p className="text-muted-foreground">Send emails and manage communication with schools</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowComposeDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Email Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_messages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sent_messages} sent, {stats.failed_messages} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_messages > 0 
                ? Math.round((stats.sent_messages / stats.total_messages) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_templates}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_templates} total templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_messages}</div>
            <p className="text-xs text-muted-foreground">
              Messages in queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">System Test</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
                <CardDescription>
                  Latest messages sent from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No messages sent yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.slice(0, 5).map((message) => (
                      <div key={message.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{message.subject}</div>
                          <div className="text-muted-foreground text-xs">
                            {message.total_recipients} recipients • {new Date(message.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(message.status || 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common messaging tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowComposeDialog(true)}
                  className="w-full justify-start"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Compose New Message
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateDialog(true)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>

                <Button 
                  variant="outline" 
                  onClick={testEmailConnection}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Test Email Connection
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Email Configuration */}
          <QuickEmailSettings />
        </TabsContent>

        <TabsContent value="history">
          <MessageHistoryTable />
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Message Templates</h3>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Template Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and manage reusable email templates
                  </p>
                  <Button onClick={() => setShowTemplateDialog(true)}>
                    Create Your First Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">System Test</h3>
              <p className="text-muted-foreground mb-6">
                Test the SMTP email system and messaging components to ensure they are working correctly
              </p>
            </div>
            
            {/* SMTP Email Test */}
            <SimpleEmailTest />
            
            {/* General Messaging System Test */}
            <MessagingSystemTest />
          </div>
        </TabsContent>

        <TabsContent value="debug">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Template Debugger</h3>
              <p className="text-muted-foreground mb-6">
                Debug template loading and creation issues
              </p>
            </div>
            <TemplateDebugger />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ComposeMessageDialog
        open={showComposeDialog}
        onOpenChange={setShowComposeDialog}
        onMessageSent={handleMessageSent}
        templates={templates}
      />

      <TemplateManagerDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onTemplateCreated={handleTemplateCreated}
      />

      <EmailSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </div>
  );
}
