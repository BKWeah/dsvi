import { supabase } from '@/integrations/supabase/client';
import { EmailSettings } from './messaging-types';
import { emailService } from './email-service';

/**
 * Initialize default email settings with Brevo configuration
 */
export async function initializeDefaultEmailSettings(): Promise<void> {
  try {
    console.log('🔄 EMAIL INIT: Starting email system initialization...');
    
    // Always initialize the email service first
    await emailService.initialize();
    
    // Check if any email settings already exist
    const { data: existingSettings } = await supabase
      .from('email_settings')
      .select('id')
      .limit(1);

    if (existingSettings && existingSettings.length > 0) {
      console.log('✅ EMAIL INIT: Email settings already exist, email service initialized');
      return;
    }

    console.log('📝 EMAIL INIT: No settings found, creating defaults...');

    // Get the default Resend API key from environment
    const defaultApiKey = import.meta.env.VITE_DEFAULT_RESEND_API_KEY;
    
    if (!defaultApiKey) {
      console.warn('⚠️ EMAIL INIT: No default Resend API key found in environment variables');
      return;
    }

    const defaultSettings: Omit<EmailSettings, 'id' | 'created_at' | 'updated_at'> = {
      provider: 'resend',
      api_key: defaultApiKey,
      api_secret: null,
      smtp_host: null,
      smtp_port: null,
      smtp_username: null,
      smtp_password: null,
      from_email: 'onboarding@libdsvi.com',
      from_name: 'DSVI Team',
      reply_to_email: 'support@dsvi.org',
      is_active: true,
      test_mode: false,
      created_by: null
    };

    // Insert the default settings
    const { error } = await supabase
      .from('email_settings')
      .insert(defaultSettings);

    if (error) {
      console.error('❌ EMAIL INIT: Failed to initialize default email settings:', error);
      throw error;
    }

    console.log('✅ EMAIL INIT: Default email settings created successfully');
    
    // Reinitialize the email service to load the new defaults
    await emailService.initialize();
    
  } catch (error) {
    console.error('💥 EMAIL INIT: Error initializing email settings:', error);
  }
}

/**
 * Update the Resend API key for existing settings
 */
export async function updateResendApiKey(newApiKey: string): Promise<boolean> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // First deactivate all existing settings
    await supabase
      .from('email_settings')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new settings with the updated API key
    const { error } = await supabase
      .from('email_settings')
      .insert({
        provider: 'resend',
        api_key: newApiKey,
        from_email: 'onboarding@libdsvi.com',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false,
        created_by: currentUser.user?.id || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update Resend API key:', error);
      return false;
    }

    console.log('Resend API key updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating Resend API key:', error);
    return false;
  }
}
