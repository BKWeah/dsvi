import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Copy, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimpleEmailService } from '@/lib/simple-email-service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: { id: string; name: string; } | null;
}

export function InviteSchoolAdminDialog({ open, onOpenChange, school }: Props) {
  const { toast } = useToast();
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const emailService = new SimpleEmailService();

  const generateLink = () => {
    if (!school) return '';
    const params = new URLSearchParams({
      school_id: school.id,
      school_name: school.name,
      role: 'SCHOOL_ADMIN'
    });
    return `${window.location.origin}/signup?${params.toString()}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateLink());
      toast({ title: "Link Copied!", description: "Signup link copied" });
    } catch {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  const sendInvitationEmail = async () => {
    if (!emailAddress.trim()) {
      toast({ 
        title: "Email Required", 
        description: "Please enter an email address", 
        variant: "destructive" 
      });
      return;
    }

    if (!school) return;

    setSendingEmail(true);
    try {
      const signupLink = generateLink();
      
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .school-info { background-color: #dcfce7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 Welcome to DSVI - School Administrator</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              
              <p>You've been invited to join the DSVI platform as the <strong>School Administrator</strong> for <strong>${school.name}</strong>!</p>
              
              <p>As a School Administrator, you'll be able to:</p>
              <ul>
                <li>🎓 Manage your school's profile and information</li>
                <li>📝 Create and update school content</li>
                <li>👥 Coordinate with DSVI administrators</li>
                <li>📊 Access school-specific features and analytics</li>
                <li>🔧 Customize your school's settings and preferences</li>
              </ul>
              
              <div class="school-info">
                <h3>🏫 Your School Assignment:</h3>
                <p><strong>School:</strong> ${school.name}</p>
                <p><strong>Role:</strong> School Administrator</p>
                <p><strong>Platform:</strong> DSVI Digital School Management</p>
              </div>
              
              <h3>🚀 Getting Started:</h3>
              <ol>
                <li>Click the signup button below to create your account</li>
                <li>Complete the registration form with your details</li>
                <li>Verify your email address</li>
                <li>Access your school's admin dashboard</li>
                <li>Explore the platform features and tools</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${signupLink}" class="button">Create Your School Admin Account →</a>
              </div>
              
              <p><strong>🔗 Direct Link:</strong> If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">${signupLink}</p>
              
              <p><strong>💡 Need Help?</strong> If you have any questions or need assistance getting started, please contact our support team or reply to this email.</p>
              
              <p>We're excited to have you on board and look forward to supporting your school's digital journey!</p>
              
              <p><strong>The DSVI Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 DSVI Platform. All rights reserved.</p>
              <p>This invitation is specific to ${school.name}. Please do not share this link.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await emailService.sendEmail({
        to: [{
          recipient_type: 'external',
          recipient_email: emailAddress.trim(),
          recipient_name: undefined
        }],
        subject: `Welcome to DSVI - ${school.name} Administrator Invitation`,
        html: emailTemplate,
        from: {
          email: 'onboarding@libdsvi.com',
          name: 'DSVI Team'
        }
      });

      if (emailResult.success) {
        toast({ 
          title: "Invitation Sent!", 
          description: `Invitation email sent successfully to ${emailAddress}` 
        });
        setEmailAddress(''); // Clear the email field
      } else {
        toast({ 
          title: "Email Failed", 
          description: "Failed to send invitation email", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      toast({ 
        title: "Email Failed", 
        description: "An error occurred while sending the email", 
        variant: "destructive" 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            School Admin Signup Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Generate signup link for <strong>{school.name}</strong>:</p>
          <div className="flex gap-2">
            <Input value={generateLink()} readOnly className="text-xs" />
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Admins using this link will be assigned to {school.name}.
          </p>

          <hr className="my-4" />

          <div className="space-y-3">
            <Label htmlFor="email">Send Invitation Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="admin@school.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={sendInvitationEmail} 
                disabled={sendingEmail}
                className="whitespace-nowrap"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send a professional invitation email with signup instructions directly to the school administrator.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
