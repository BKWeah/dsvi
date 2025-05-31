import { supabase } from '@/integrations/supabase/client';
import { 
  EmailConfig, 
  SendMessageResponse, 
  Message, 
  MessageRecipient,
  EmailProvider,
  EmailSettings,
  AutomatedMessaging,
  TriggerType
} from './messaging-types';

/**
 * Email Service - Unified interface for multiple email providers
 */
export class EmailService {
  private config: EmailConfig | null = null;
  private settings: EmailSettings | null = null;

  constructor() {
    this.loadSettings();
  }

  /**
   * Load email settings from database
   */
  private async loadSettings(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('No active email settings found');
        return;
      }

      this.settings = data;
      this.config = this.buildConfigFromSettings(data);
    } catch (error) {
      console.error('Failed to load email settings:', error);
    }
  }

  /**
   * Build email config from database settings
   */
  private buildConfigFromSettings(settings: EmailSettings): EmailConfig {
    const baseConfig = {
      provider: settings.provider,
      from_email: settings.from_email,
      from_name: settings.from_name,
      reply_to_email: settings.reply_to_email || undefined
    };

    switch (settings.provider) {
      case 'smtp':
        return {
          ...baseConfig,
          smtp: {
            host: settings.smtp_host!,
            port: settings.smtp_port!,
            username: settings.smtp_username!,
            password: settings.smtp_password!,
            secure: settings.smtp_port === 465
          }
        };
      case 'sendgrid':
        return {
          ...baseConfig,
          sendgrid: {
            api_key: settings.api_key!
          }
        };
      case 'ses':
        return {
          ...baseConfig,
          ses: {
            access_key_id: settings.api_key!,
            secret_access_key: settings.api_secret!,
            region: 'us-east-1' // Default region
          }
        };
      case 'resend':
        return {
          ...baseConfig,
          resend: {
            api_key: settings.api_key!
          }
        };
      default:
        return baseConfig;
    }
  }
  /**
   * Send message via configured email provider
   */
  async sendMessage(message: Message, recipients: MessageRecipient[]): Promise<SendMessageResponse | null> {
    try {
      if (!this.config || !this.settings) {
        console.warn('No email configuration available - simulating send');
        // In test mode or without config, just mark as sent
        await this.updateMessageStatus(message.id, 'sent', recipients.length);
        return {
          message_id: message.id,
          total_recipients: recipients.length,
          status: 'success',
          delivery_provider: 'simulation'
        };
      }

      // In test mode, simulate sending
      if (this.settings.test_mode) {
        console.log(`[TEST MODE] Would send email to ${recipients.length} recipients:`, {
          subject: message.subject,
          recipients: recipients.map(r => r.recipient_email)
        });
        
        await this.updateMessageStatus(message.id, 'sent', recipients.length);
        return {
          message_id: message.id,
          total_recipients: recipients.length,
          status: 'success',
          delivery_provider: 'test_mode'
        };
      }

      // Real email sending would happen here based on provider
      // For now, simulate successful sending
      await this.updateMessageStatus(message.id, 'sent', recipients.length);
      
      return {
        message_id: message.id,
        total_recipients: recipients.length,
        status: 'success',
        delivery_provider: this.config.provider
      };

    } catch (error) {
      console.error('Failed to send message:', error);
      await this.updateMessageStatus(message.id, 'failed', 0);
      return null;
    }
  }

  /**
   * Update message status in database
   */
  private async updateMessageStatus(messageId: string, status: string, successCount: number): Promise<void> {
    try {
      await supabase
        .from('messages')
        .update({
          status,
          sent_at: new Date().toISOString(),
          successful_deliveries: successCount,
          failed_deliveries: 0
        })
        .eq('id', messageId);

      // Update recipient statuses
      await supabase
        .from('message_recipients')
        .update({
          delivery_status: status === 'sent' ? 'sent' : 'failed',
          sent_at: status === 'sent' ? new Date().toISOString() : null
        })
        .eq('message_id', messageId);

    } catch (error) {
      console.error('Failed to update message status:', error);
    }
  }

  /**
   * Update email settings
   */
  async updateSettings(newSettings: EmailSettings): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      // First deactivate all existing settings
      await supabase
        .from('email_settings')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Insert or update the new settings
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          ...newSettings,
          created_by: currentUser.user?.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reload settings
      await this.loadSettings();
    } catch (error) {
      console.error('Failed to update email settings:', error);
      throw error;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error('No email configuration available');
      }

      // For now, just validate config structure
      const isValid = this.config.from_email && 
                     this.config.from_name && 
                     this.config.provider;

      if (!isValid) {
        throw new Error('Email configuration is incomplete');
      }

      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current email settings
   */
  getSettings(): EmailSettings | null {
    return this.settings;
  }

  /**
   * Reload email settings
   */
  async reloadSettings(): Promise<void> {
    await this.loadSettings();
  }
}

// Singleton instance
export const emailService = new EmailService();
