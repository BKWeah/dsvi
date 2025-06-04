import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  ExternalLink, 
  Mail, 
  Shield, 
  School, 
  Calendar,
  Check
} from 'lucide-react';

interface InvitationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationData: {
    email: string;
    name: string;
    signupLink: string;
    permissions: string[];
    schools: string[];
    tempPassword: string;
    expiresAt: string;
  };
}

export function InvitationSuccessDialog({ 
  open, 
  onOpenChange, 
  invitationData 
}: InvitationSuccessDialogProps) {
  const { toast } = useToast();

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
        description: `Failed to copy ${label}. Please copy manually.`,
        variant: "destructive",
      });
    }
  };

  const openSignupLink = () => {
    window.open(invitationData.signupLink, '_blank');
  };

  const sendEmail = () => {
    const subject = encodeURIComponent('DSVI Admin Account Invitation');
    const body = encodeURIComponent(`Hi ${invitationData.name},

You've been invited to join as a Level 2 (Assigned Staff) administrator for the DSVI school management system.

Please click the link below to set up your account:
${invitationData.signupLink}

Your temporary password is: ${invitationData.tempPassword}
(You can change this during signup)

IMPORTANT: Please confirm your email address (${invitationData.email}) during signup for security.

This invitation expires on: ${new Date(invitationData.expiresAt).toLocaleDateString()}

If you have any questions, please contact your administrator.

Best regards,
DSVI Admin Team`);

    window.location.href = `mailto:${invitationData.email}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Level 2 Admin Invitation Created
          </DialogTitle>
          <DialogDescription>
            Send the signup link to {invitationData.name} to complete their account setup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Invitation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Admin Name</Label>
                  <p className="font-medium">{invitationData.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{obscureEmail(invitationData.email)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permissions</Label>
                  <p className="font-medium">{invitationData.permissions.length} assigned</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Schools</Label>
                  <p className="font-medium">{invitationData.schools.length} assigned</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Expires</Label>
                <p className="font-medium text-orange-600">
                  {new Date(invitationData.expiresAt).toLocaleDateString()} 
                  <span className="text-sm text-muted-foreground ml-2">
                    (7 days from now)
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Signup Link */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Signup Link
              </CardTitle>
              <CardDescription>
                Send this secure link to the new admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Invitation URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationData.signupLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(invitationData.signupLink, 'Signup link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={openSignupLink} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Signup Link
                </Button>
                <Button variant="outline" onClick={sendEmail} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Temporary Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Temporary Password</CardTitle>
              <CardDescription>
                Pre-filled in the signup form, but user can change it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={invitationData.tempPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(invitationData.tempPassword, 'Temporary password')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(invitationData.signupLink, 'Signup link')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={sendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
