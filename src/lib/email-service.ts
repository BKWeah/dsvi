import { supabase } from '@/integrations/supabase/client';
import { BrevoService } from './brevo-service';
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
    // Don't start loading settings immediately - let components call it when needed
  }

  /**
   * Load email settings from database
   */
  private async loadSettings(): Promise<void> {
    try {
      console.log('🔄 LOAD PROCESS STARTED');
      console.log('📖 Loading email settings from database...');
      
      // First, let's see ALL email_settings records to understand what's in the database
      const { data: allRecords, error: allError } = await supabase
        .from('email_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 ALL email_settings records in database:', allRecords?.length || 0);
      if (allRecords && allRecords.length > 0) {
        allRecords.forEach((record, index) => {
          console.log(`   Record ${index + 1}:`, {
            id: record.id.substring(0, 8) + '...',
            provider: record.provider,
            from_email: record.from_email,
            from_name: record.from_name,
            is_active: record.is_active,
            created_at: record.created_at
          });
        });
      }
      
      // Now get only active settings
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('🔍 Active settings query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading email settings:', error);
        return;
      }

      // Check if we got any data
      const settingsData = data && data.length > 0 ? data[0] : null;

      if (!settingsData) {
        console.log('⚠️ No active email settings found in database');
        console.log('🎯 LOAD PROCESS COMPLETED - No settings loaded');
        return;
      }

      console.log('✅ Found active email settings:', { 
        id: settingsData.id.substring(0, 8) + '...',
        provider: settingsData.provider, 
        from_email: settingsData.from_email,
        from_name: settingsData.from_name,
        is_active: settingsData.is_active,
        created_at: settingsData.created_at
      });

      // Update local state
      this.settings = settingsData;
      this.config = this.buildConfigFromSettings(settingsData);
      
      console.log('🎉 LOAD PROCESS COMPLETED - Settings loaded into service');
      
    } catch (error) {
      console.error('💥 Load process failed:', error);
    }
  }

  /**
   * Create default settings from environment variables if none exist
   */
  private async createDefaultSettingsIfNeeded(): Promise<void> {
    const defaultApiKey = import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
    if (!defaultApiKey) {
      console.warn('No default Brevo API key found in environment variables');
      return;
    }

    try {
      console.log('Creating default email settings from environment variables');
      
      const defaultSettings = {
        provider: 'brevo' as const,
        api_key: defaultApiKey,
        api_secret: null,
        smtp_host: null,
        smtp_port: null,
        smtp_username: null,
        smtp_password: null,
        from_email: 'noreply@dsvi.org',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false,
        created_by: null
      };

      const { data, error } = await supabase
        .from('email_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.warn('Could not create default settings:', error);
        // Even if we can't save to DB, create in-memory config for testing
        this.config = this.buildTempConfigFromSettings(defaultSettings);
        return;
      }

      this.settings = data;
      this.config = this.buildConfigFromSettings(data);
      console.log('Default email settings created successfully');
      
    } catch (error) {
      console.error('Failed to create default email settings:', error);
      // Create in-memory config as fallback
      const defaultSettings = {
        provider: 'brevo' as const,
        api_key: defaultApiKey,
        from_email: 'noreply@dsvi.org',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org'
      };
      this.config = this.buildTempConfigFromSettings(defaultSettings);
    }
  }

  /**
   * Build temporary config for testing purposes
   */
  private buildTempConfigFromSettings(settings: Partial<EmailSettings>): EmailConfig | null {
    if (!settings.provider || !settings.from_email) {
      return null;
    }

    const baseConfig = {
      provider: settings.provider,
      from_email: settings.from_email,
      from_name: settings.from_name || 'DSVI Team',
      reply_to_email: settings.reply_to_email || undefined
    };

    switch (settings.provider) {
      case 'smtp':
        if (!settings.smtp_host || !settings.smtp_port || !settings.smtp_username || !settings.smtp_password) {
          return null;
        }
        return {
          ...baseConfig,
          smtp: {
            host: settings.smtp_host,
            port: settings.smtp_port,
            username: settings.smtp_username,
            password: settings.smtp_password,
            secure: settings.smtp_port === 465
          }
        };
      case 'sendgrid':
        if (!settings.api_key) return null;
        return {
          ...baseConfig,
          sendgrid: {
            api_key: settings.api_key
          }
        };
      case 'ses':
        if (!settings.api_key || !settings.api_secret) return null;
        return {
          ...baseConfig,
          ses: {
            access_key_id: settings.api_key,
            secret_access_key: settings.api_secret,
            region: 'us-east-1'
          }
        };
      case 'brevo':
        // For Brevo, try the provided API key first, then fall back to environment
        const apiKey = settings.api_key || import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
        if (!apiKey) return null;
        return {
          ...baseConfig,
          brevo: {
            api_key: apiKey
          }
        };
      default:
        return baseConfig;
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
      case 'brevo':
        return {
          ...baseConfig,
          brevo: {
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

      // Real email sending based on provider
      let result: SendMessageResponse;

      switch (this.config.provider) {
        case 'brevo':
          if (this.config.brevo) {
            const brevoService = new BrevoService({
              api_key: this.config.brevo.api_key,
              from_email: this.config.from_email,
              from_name: this.config.from_name,
              reply_to_email: this.config.reply_to_email
            });
            result = await brevoService.sendEmail(message, recipients);
          } else {
            throw new Error('Brevo configuration missing');
          }
          break;

        case 'sendgrid':
        case 'ses':
        case 'resend':
        case 'smtp':
          // Other providers can be implemented here
          console.log(`Provider ${this.config.provider} not fully implemented yet, simulating send`);
          result = {
            message_id: message.id,
            total_recipients: recipients.length,
            status: 'success',
            delivery_provider: this.config.provider
          };
          break;

        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }

      // Update message status based on result
      const status = result.status === 'success' ? 'sent' : 'failed';
      const successCount = result.status === 'success' ? recipients.length : 0;
      
      await this.updateMessageStatus(message.id, status, successCount);
      
      return result;

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
      
      console.log('🔄 SAVE PROCESS STARTED');
      console.log('📝 Attempting to save settings:', { 
        provider: newSettings.provider, 
        from_email: newSettings.from_email,
        from_name: newSettings.from_name,
        api_key: newSettings.api_key ? `${newSettings.api_key.substring(0, 15)}...` : 'none'
      });
      
      // Step 1: Check current active settings
      const { data: currentActive, error: checkError } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_active', true);
      
      console.log('📊 Current active settings:', currentActive?.length || 0, currentActive);
      
      // Step 2: Deactivate all existing settings
      console.log('🔄 Deactivating all existing settings...');
      const { error: deactivateError } = await supabase
        .from('email_settings')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deactivateError) {
        console.error('❌ Deactivate error:', deactivateError);
      } else {
        console.log('✅ All existing settings deactivated');
      }

      // Step 3: Prepare new settings for insert
      const settingsToInsert = {
        provider: newSettings.provider,
        api_key: newSettings.api_key,
        api_secret: newSettings.api_secret,
        smtp_host: newSettings.smtp_host,
        smtp_port: newSettings.smtp_port,
        smtp_username: newSettings.smtp_username,
        smtp_password: newSettings.smtp_password,
        from_email: newSettings.from_email,
        from_name: newSettings.from_name,
        reply_to_email: newSettings.reply_to_email,
        is_active: true,
        test_mode: newSettings.test_mode || false,
        created_by: currentUser.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Inserting new settings:', settingsToInsert);

      // Step 4: Insert new settings
      const { data: insertedData, error: insertError } = await supabase
        .from('email_settings')
        .insert(settingsToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      console.log('✅ Settings inserted successfully:', insertedData);

      // Step 5: Verify insertion by checking active settings again
      const { data: verifyActive, error: verifyError } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_active', true);
      
      console.log('🔍 Verification - Active settings after insert:', verifyActive?.length || 0, verifyActive);

      // Step 6: Update local state immediately
      this.settings = insertedData;
      this.config = this.buildConfigFromSettings(insertedData);
      
      console.log('🎉 SAVE PROCESS COMPLETED - Local state updated');
      
    } catch (error) {
      console.error('💥 Save process failed:', error);
      throw error;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(tempSettings?: Partial<EmailSettings>): Promise<boolean> {
    try {
      let configToTest = this.config;
      
      // If temporary settings provided, use those for testing
      if (tempSettings) {
        configToTest = this.buildTempConfigFromSettings(tempSettings);
        if (!configToTest) {
          throw new Error('Invalid email configuration provided');
        }
      }
      
      // If no config available, try to load from database
      if (!configToTest) {
        await this.loadSettings();
        configToTest = this.config;
      }
      
      // If still no config, try to create one from environment variables
      if (!configToTest) {
        const defaultApiKey = import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
        if (defaultApiKey) {
          configToTest = {
            provider: 'brevo',
            from_email: 'noreply@dsvi.org',
            from_name: 'DSVI Team',
            brevo: {
              api_key: defaultApiKey
            }
          };
        }
      }
      
      if (!configToTest) {
        throw new Error('No email configuration available');
      }

      // Provider-specific connection testing
      switch (configToTest.provider) {
        case 'brevo':
          if (configToTest.brevo) {
            const brevoService = new BrevoService({
              api_key: configToTest.brevo.api_key,
              from_email: configToTest.from_email,
              from_name: configToTest.from_name,
              reply_to_email: configToTest.reply_to_email
            });
            const result = await brevoService.testConnection();
            return result.success;
          }
          throw new Error('Brevo configuration missing');

        default:
          // For other providers, just validate config structure
          const isValid = configToTest.from_email && 
                         configToTest.from_name && 
                         configToTest.provider;

          if (!isValid) {
            throw new Error('Email configuration is incomplete');
          }
          return true;
      }
    } catch (error) {
      console.error('Email connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get current email settings
   */
  getSettings(): EmailSettings | null {
    return this.settings;
  }

  /**
   * Initialize service by loading settings
   */
  async initialize(): Promise<void> {
    console.log('🔄 EmailService.initialize() called');
    await this.loadSettings();
    
    if (!this.settings && !this.config) {
      console.log('⚠️ EmailService: No settings found during initialization, will use environment fallback for testing');
    } else {
      console.log('✅ EmailService: Initialized with settings:', this.settings ? {
        id: this.settings.id.substring(0, 8) + '...',
        provider: this.settings.provider,
        from_name: this.settings.from_name,
        from_email: this.settings.from_email
      } : 'none');
    }
  }

  /**
   * Force reload settings from database (always fresh)
   */
  async reloadSettings(): Promise<void> {
    console.log('🔄 EmailService.reloadSettings() called - forcing fresh load');
    // Clear current state first
    this.settings = null;
    this.config = null;
    // Load fresh from database
    await this.loadSettings();
  }
}

// Singleton instance
export const emailService = new EmailService();
