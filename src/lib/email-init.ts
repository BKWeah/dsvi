import { supabase } from '@/integrations/supabase/client';
import { EmailSettings } from './messaging-types';

/**
 * Initialize default email settings with Brevo configuration
 */
export async function initializeDefaultEmailSettings(): Promise<void> {
  try {
    // Check if any email settings already exist
    const { data: existingSettings } = await supabase
      .from('email_settings')
      .select('id')
      .limit(1);

    if (existingSettings && existingSettings.length > 0) {
      console.log('Email settings already exist, skipping initialization');
      return;
    }

    // Get the default Brevo API key from environment
    const defaultApiKey = import.meta.env.VITE_DEFAULT_BREVO_API_KEY;
    
    if (!defaultApiKey) {
      console.warn('No default Brevo API key found in environment variables');
      return;
    }

    const defaultSettings: Omit<EmailSettings, 'id' | 'created_at' | 'updated_at'> = {
      provider: 'brevo',
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

    // Insert the default settings
    const { error } = await supabase
      .from('email_settings')
      .insert(defaultSettings);

    if (error) {
      console.error('Failed to initialize default email settings:', error);
      throw error;
    }

    console.log('Default email settings initialized successfully with Brevo');
  } catch (error) {
    console.error('Error initializing email settings:', error);
  }
}

/**
 * Update the Brevo API key for existing settings
 */
export async function updateBrevoApiKey(newApiKey: string): Promise<boolean> {
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
        provider: 'brevo',
        api_key: newApiKey,
        from_email: 'noreply@dsvi.org',
        from_name: 'DSVI Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false,
        created_by: currentUser.user?.id || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update Brevo API key:', error);
      return false;
    }

    console.log('Brevo API key updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating Brevo API key:', error);
    return false;
  }
}
