import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Mail, 
  Copy, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  HardDrive
} from 'lucide-react';

interface PendingInvitation {
  id?: string; // Database ID
  email: string;
  name: string;
  notes: string;
  permissions: string[];
  schools: string[] | UUID[];
  tempPassword: string;
  inviteToken: string;
  emailHash?: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  signupLink?: string;
  isUsed?: boolean;
}

interface PendingInvitationsProps {
  onRefresh: () => void;
}

export function PendingInvitations({ onRefresh }: PendingInvitationsProps) {
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [activatedAdmins, setActivatedAdmins] = useState<string[]>([]);
  const [loadingDatabase, setLoadingDatabase] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingInvitations();
    checkActivatedAdmins();
  }, []);

  const loadPendingInvitations = async () => {
    setLoadingDatabase(true);
    
    try {
      // First try to load from database
      console.log('🔄 Attempting to load invitations from database...');
      
      const { data: dbInvitations, error: dbError } = await supabase.rpc('list_pending_invitations');
      
      if (!dbError && dbInvitations && Array.isArray(dbInvitations)) {
        console.log('✅ Successfully loaded from database:', dbInvitations.length, 'invitations');
        
        // Convert database format to component format
        const formattedInvitations = dbInvitations.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          notes: inv.notes || '',
          permissions: inv.permissions || [],
          schools: inv.school_ids || [],
          tempPassword: inv.temp_password || '',
          inviteToken: inv.invite_token,
          emailHash: inv.email_hash,
          createdBy: inv.created_by,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          signupLink: inv.signup_link,
          isUsed: inv.is_used
        }));
        
        setPendingInvitations(formattedInvitations.filter(inv => !inv.isUsed));
        setUsingLocalStorage(false);
        
      } else {
        console.warn('⚠️ Database load failed, falling back to localStorage:', dbError?.message);
        
        // Fallback to localStorage
        const localInvitations = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
        const pendingWithLinks = localInvitations.map((invite: PendingInvitation) => ({
          ...invite,
          signupLink: invite.signupLink || generateSignupLink(invite)
        }));
        
        setPendingInvitations(pendingWithLinks);
        setUsingLocalStorage(true);
        
        if (dbError) {
          console.error('Database error details:', dbError);
        }
      }
      
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      
      // Fallback to localStorage on any error
      try {
        const localInvitations = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
        setPendingInvitations(localInvitations);
        setUsingLocalStorage(true);
      } catch (localError) {
        console.error('LocalStorage also failed:', localError);
        setPendingInvitations([]);
      }
    } finally {
      setLoadingDatabase(false);
    }
  };

  const checkActivatedAdmins = () => {
    const activated = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
    setActivatedAdmins(activated);
  };

  const generateSignupLink = (invite: PendingInvitation): string => {
    if (invite.signupLink) {
      return invite.signupLink;
    }
    
    const baseUrl = window.location.origin;
    const emailHash = invite.emailHash || btoa(invite.email);
    return `${baseUrl}/level2-admin-signup?token=${encodeURIComponent(invite.inviteToken)}&eh=${emailHash}&pwd=${encodeURIComponent(invite.tempPassword)}&name=${encodeURIComponent(invite.name)}`;
  };

  const obscureEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    return `${localPart.substring(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}@${domain}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Failed to copy ${label}`,
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (invite: PendingInvitation) => {
    try {
      if (!usingLocalStorage && invite.id) {
        // Delete from database
        const { error } = await supabase
          .from('pending_admin_invitations')
          .delete()
          .eq('id', invite.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Delete from localStorage
        const updated = pendingInvitations.filter(inv => inv.inviteToken !== invite.inviteToken);
        localStorage.setItem('pendingLevel2Admins', JSON.stringify(updated));
      }
      
      // Refresh the list
      await loadPendingInvitations();
      
      toast({
        title: "Invitation Deleted",
        description: "The invitation has been removed",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const sendEmail = (invite: PendingInvitation) => {
    const subject = encodeURIComponent('DSVI Admin Account Invitation');
    const body = encodeURIComponent(`Hi ${invite.name},

You've been invited to join as a Level 2 (Assigned Staff) administrator.

Click here to set up your account:
${invite.signupLink || generateSignupLink(invite)}

Temporary password: ${invite.tempPassword}
Expires: ${new Date(invite.expiresAt).toLocaleDateString()}

Please confirm your email address during signup for security.

Best regards,
DSVI Admin Team`);

    window.location.href = `mailto:${invite.email}?subject=${subject}&body=${body}`;
  };

  const getInvitationStatus = (invite: PendingInvitation) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);
    const isActivated = activatedAdmins.includes(invite.email.toLowerCase());

    if (isActivated || invite.isUsed) {
      return { status: 'activated', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (now > expiresAt) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', icon: XCircle };
    } else {
      return { status: 'pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
  };

  const getDaysUntilExpiry = (expiresAt: string): number => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (pendingInvitations.length === 0 && !loadingDatabase) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations (0)
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            {usingLocalStorage ? (
              <>
                <HardDrive className="h-4 w-4" />
                Reading from localStorage - no database invitations found
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Reading from database - no pending invitations
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pending invitations found. Create a Level 2 admin invitation to see it here.
          </p>
          <Button variant="outline" size="sm" onClick={loadPendingInvitations} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {usingLocalStorage ? (
                <>
                  <HardDrive className="h-4 w-4" />
                  Reading from localStorage (database unavailable)
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Reading from database
                </>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPendingInvitations}
            disabled={loadingDatabase}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingDatabase ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingInvitations.map((invite) => {
            const statusInfo = getInvitationStatus(invite);
            const StatusIcon = statusInfo.icon;
            const daysLeft = getDaysUntilExpiry(invite.expiresAt);

            return (
              <Card key={invite.inviteToken} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{invite.name}</h4>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                        </Badge>
                        {statusInfo.status === 'pending' && daysLeft <= 2 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{obscureEmail(invite.email)}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(invite.createdAt).toLocaleDateString()}</span>
                        <span>Permissions: {invite.permissions?.length || 0}</span>
                        <span>Schools: {invite.schools?.length || 0}</span>
                        <span>Expires: {new Date(invite.expiresAt).toLocaleDateString()}</span>
                      </div>

                      {invite.notes && (
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {invite.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {statusInfo.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(invite.signupLink || generateSignupLink(invite), 'Signup link')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(invite.signupLink || generateSignupLink(invite), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendEmail(invite)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteInvitation(invite)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {statusInfo.status === 'pending' && (
                    <div className="mt-3 p-3 bg-muted rounded border-l-4 border-l-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Signup Link Ready</p>
                          <p className="text-xs text-muted-foreground">
                            Send this link to {invite.name} to complete their signup
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(invite.signupLink || generateSignupLink(invite), 'Signup link')}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendEmail(invite)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
