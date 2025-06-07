import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { EmailSettings, EmailProvider } from '@/lib/messaging-types';
import { Settings, TestTube, Save, Mail } from 'lucide-react';

interface EmailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailSettingsDialog({ open, onOpenChange }: EmailSettingsDialogProps) {
  const [settings, setSettings] = useState<Partial<EmailSettings>>({
    provider: 'smtp',
    from_email: '',
    from_name: 'DSVI Team',
    reply_to_email: '',
    is_active: false,
    test_mode: true
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);
  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await emailService.getSettings();
      if (currentSettings) {
        setSettings(currentSettings);
      }
    } catch (error) {
      console.error('Failed to load email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await emailService.updateSettings(settings as EmailSettings);
      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await emailService.testConnection();
      if (result) {
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
      console.error('Failed to test connection:', error);
      toast({
        title: "Error",
        description: "Failed to test email connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Settings
          </DialogTitle>
          <DialogDescription>
            Configure email provider settings for sending messages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Email Provider</Label>
            <Select 
              value={settings.provider} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, provider: value as EmailProvider }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="brevo">Brevo (Sendinblue)</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="ses">Amazon SES</SelectItem>
                <SelectItem value="resend">Resend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                type="email"
                value={settings.from_email}
                onChange={(e) => setSettings(prev => ({ ...prev, from_email: e.target.value }))}
                placeholder="noreply@dsvi.org"
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={settings.from_name}
                onChange={(e) => setSettings(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="DSVI Team"
              />
            </div>
          </div>

          {/* SMTP Settings */}
          {settings.provider === 'smtp' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.smtp_host || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.smtp_port || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={settings.smtp_username || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={settings.smtp_password || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                      placeholder="app-password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Key Settings */}
          {(settings.provider === 'sendgrid' || settings.provider === 'resend' || settings.provider === 'brevo') && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={settings.api_key || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder={settings.provider === 'brevo' ? 'xkeysib-...' : 'Enter your API key'}
              />
              {settings.provider === 'brevo' && (
                <p className="text-sm text-muted-foreground">
                  Get your API key from Brevo Dashboard → API & Integrations → SMTP & API
                </p>
              )}
            </div>
          )}

          {/* Status Toggles */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Test Mode</Label>
              <p className="text-sm text-muted-foreground">Enable test mode for development</p>
            </div>
            <Switch
              checked={settings.test_mode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, test_mode: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Enable email sending</p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
