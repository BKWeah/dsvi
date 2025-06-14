import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/lib/email-service';
import { EmailSettings } from '@/lib/messaging-types';
import { Key, Save, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';

export function QuickEmailSettings() {
  const [settings, setSettings] = useState<Partial<EmailSettings>>({
    provider: 'resend', // Changed default provider to Resend
    api_key: import.meta.env.VITE_DEFAULT_RESEND_API_KEY || '', // Changed default API key env var
    from_email: 'onboarding@libdsvi.com',
    from_name: 'DSVI Team',
    is_active: false
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await emailService.getSettings();
      if (currentSettings) {
        setSettings(currentSettings);
        testConnectionStatus();
      }
    } catch (error) {
      console.error('Failed to load email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnectionStatus = async () => {
    try {
      const result = await emailService.testConnection();
      setConnectionStatus(result ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    }
  };
  const handleQuickSave = async () => {
    try {
      setSaving(true);
      await emailService.updateSettings(settings as EmailSettings);
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
      testConnectionStatus();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to update email settings",
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
      setConnectionStatus(result ? 'success' : 'error');
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
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Failed to test email connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Key className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Email Configuration
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Quick email provider settings management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label>Email Provider</Label>
          <Select 
            value={settings.provider} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, provider: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resend">Resend (Recommended)</SelectItem> {/* Set Resend as recommended */}
              <SelectItem value="brevo">Brevo</SelectItem> {/* Removed (Recommended) from Brevo */}
              <SelectItem value="sendgrid">SendGrid</SelectItem>
              <SelectItem value="smtp">SMTP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Key for supported providers */}
        {(settings.provider === 'brevo' || settings.provider === 'sendgrid' || settings.provider === 'resend') && (
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={settings.api_key || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder={settings.provider === 'brevo' ? 'xkeysib-...' : 'Enter your API key'}
            />
            {/* Removed provider-specific API key alert as it's now fetched from DB */}
          </div>
        )}

        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings(prev => ({ ...prev, from_email: e.target.value }))}
              placeholder="onboarding@libdsvi.com"
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

        {/* Connection Status */}
        <div className={`text-sm ${getStatusColor()}`}>
          Status: {connectionStatus === 'success' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Unknown'}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={testing} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleQuickSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
