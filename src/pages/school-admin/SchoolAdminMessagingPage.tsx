import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, MessageSquare, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { useAuth } from '@/contexts/AuthContext';
import { ComposeMessageDialog } from '@/components/dsvi-admin/messaging/ComposeMessageDialog';

export default function SchoolAdminMessagingPage() {
  const [accessibleSchools, setAccessibleSchools] = useState<Array<{id: string, name: string}>>([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [stats, setStats] = useState({
    total_messages: 0,
    sent_messages: 0,
    accessible_schools: 0
  });
  const [loading, setLoading] = useState(true);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get accessible schools for this school admin
      const schools = await messagingService.getAccessibleSchools();
      setAccessibleSchools(schools);
      
      // Get recent messages sent by this user
      const messages = await messagingService.getMessages(10, 0);
      setRecentMessages(messages);
      
      // Update stats
      setStats({
        total_messages: messages.length,
        sent_messages: messages.filter(m => m.status === 'sent').length,
        accessible_schools: schools.length
      });
      
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messaging</h1>
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
          <h1 className="text-3xl font-bold">Messaging</h1>
          <p className="text-muted-foreground">Send messages to other school administrators</p>
        </div>
        <Button onClick={() => setShowComposeDialog(true)}>
          <Send className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Schools</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accessible_schools}</div>
            <p className="text-xs text-muted-foreground">
              Schools you can message
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent_messages}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_messages}</div>
            <p className="text-xs text-muted-foreground">
              All time messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Access Notice */}
      {accessibleSchools.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Schools Assigned</h3>
            <p className="text-muted-foreground">
              You don't have access to any schools yet. Contact a DSVI administrator to get school assignments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accessible Schools */}
      {accessibleSchools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Schools</CardTitle>
            <CardDescription>
              Schools you can send messages to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {accessibleSchools.map((school) => (
                <Badge key={school.id} variant="outline">
                  {school.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ComposeMessageDialog
        open={showComposeDialog}
        onOpenChange={setShowComposeDialog}
        onMessageSent={handleMessageSent}
        templates={[]}
        preSelectedSchools={accessibleSchools.map(s => s.id)}
      />
    </div>
  );
}
