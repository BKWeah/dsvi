/**
 * Quick fix script to resolve email settings provider mismatch
 * Run this in the browser console on your admin page
 */

async function fixEmailSettings() {
  console.log('🔧 Starting email settings fix...');
  
  try {
    // Check if we're in the right context
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found. Please run this on your admin page.');
      return;
    }

    // Get the Resend API key from environment
    const resendApiKey = 're_6ayikHHF_JhrAdn6hK4iEPKCThk9vquJq'; // From your .env file
    
    if (!resendApiKey) {
      console.error('❌ Resend API key not found');
      return;
    }

    // First, check current email settings
    console.log('🔍 Checking current email settings...');
    const { data: currentSettings } = await supabase
      .from('email_settings')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📊 Current settings:', currentSettings);

    // Deactivate all existing settings
    console.log('🔄 Deactivating existing settings...');
    await supabase
      .from('email_settings')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Create new Resend settings
    console.log('✨ Creating new Resend settings...');
    const { data: newSettings, error } = await supabase
      .from('email_settings')
      .insert({
        provider: 'resend',
        api_key: resendApiKey,
        from_email: 'onboarding@libgss.com',
        from_name: 'GSS Team',
        reply_to_email: 'support@dsvi.org',
        is_active: true,
        test_mode: false,
        created_by: null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating Resend settings:', error);
      return;
    }

    console.log('✅ Successfully created Resend settings:', newSettings);
    
    // Verify the fix
    console.log('🔍 Verifying active settings...');
    const { data: activeSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('is_active', true)
      .eq('provider', 'resend');
    
    console.log('✅ Active Resend settings:', activeSettings);
    
    if (activeSettings && activeSettings.length > 0) {
      console.log('🎉 Email settings fix completed successfully!');
      console.log('📧 You should now be able to send emails.');
      
      // Suggest testing
      console.log('💡 Next steps:');
      console.log('1. Try sending a test email');
      console.log('2. Check the "Test Email Connection" button in Email Settings');
    } else {
      console.log('⚠️ Fix may not have worked properly. Check the database manually.');
    }

  } catch (error) {
    console.error('💥 Error during fix:', error);
  }
}

// Run the fix
fixEmailSettings();
