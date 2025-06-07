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
      console.log('🔄 UI LOAD PROCESS STARTED');
      
      // Force a fresh reload of settings from database
      console.log('🔄 Forcing fresh reload from database...');
      await emailService.reloadSettings();
      
      const currentSettings = await emailService.getSettings();
      console.log('📖 EmailService.getSettings() returned:', currentSettings);
      
      if (currentSettings) {
        console.log('✅ Found existing settings, loading into form:', {
          provider: currentSettings.provider,
          from_email: currentSettings.from_email,
          from_name: currentSettings.from_name,
          is_active: currentSettings.is_active
        });
        setSettings(currentSettings);
      } else {
        console.log('⚠️ No existing settings found, setting up default form values');
        // If no settings found, set up default form values (not saved to DB)
        const defaultApiKey = import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
        const defaultFormSettings = {
          provider: 'brevo' as const,
          api_key: defaultApiKey || '',
          api_secret: null,
          smtp_host: null,
          smtp_port: null,
          smtp_username: null,
          smtp_password: null,
          from_email: 'noreply@dsvi.org',
          from_name: 'DSVI Team',
          reply_to_email: 'support@dsvi.org',
          is_active: true,
          test_mode: false
        };
        console.log('📝 Setting default form values:', defaultFormSettings);
        setSettings(defaultFormSettings);
      }
      
      console.log('🎉 UI LOAD PROCESS COMPLETED');
    } catch (error) {
      console.error('💥 UI Load process failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('🔄 UI SAVE PROCESS STARTED');
      console.log('📝 Form settings to save:', {
        provider: settings.provider,
        from_email: settings.from_email,
        from_name: settings.from_name,
        is_active: settings.is_active,
        test_mode: settings.test_mode
      });
      
      await emailService.updateSettings(settings as EmailSettings);
      
      console.log('✅ EmailService.updateSettings() completed successfully');
      
      // Force reload to ensure local state is in sync with database
      console.log('🔄 Forcing reload after save...');
      await emailService.reloadSettings();
      
      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
      
      console.log('🎉 UI SAVE PROCESS COMPLETED');
      onOpenChange(false);
    } catch (error) {
      console.error('💥 UI Save process failed:', error);
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
      
      // Pass current form settings to test method
      const result = await emailService.testConnection(settings);
      
      toast({
        title: "Success",
        description: "Email connection test successful! Your configuration is working.",
      });
    } catch (error) {
      console.error('Failed to test connection:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Email connection test failed",
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
