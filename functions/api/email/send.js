/**
 * Cloudflare Pages Function for sending emails via Resend
 * Simple, reliable implementation using native fetch and Resend API
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js'; // Import Supabase client

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    // Initialize Supabase client
    const supabaseUrl = env.VITE_SUPABASE_URL; // Corrected environment variable name
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY; // Corrected environment variable name

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key not configured in environment');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch active email settings from database
    const { data: emailSettings, error: dbError } = await supabase
      .from('email_settings')
      .select('*')
      .eq('is_active', true)
      .eq('provider', 'resend') // Ensure we get Resend settings
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError || !emailSettings) {
      console.error('Database error fetching email settings:', dbError);
      throw new Error('Failed to retrieve active email settings from database.');
    }

    const resendApiKey = emailSettings.api_key;
    if (!resendApiKey) {
      throw new Error('Resend API key not found in database settings.');
    }
    const resend = new Resend(resendApiKey);

    // Parse request body
    const { to, subject, html, from } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: to, subject, html'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Prepare email data for Resend
    const emailData = {
      from: from?.email || emailSettings.from_email, // Use from_email from database settings as fallback
      to: Array.isArray(to) ? to.map(recipient => recipient.email) : [to],
      subject: subject,
      html: html,
      tags: [{ name: 'category', value: 'dsvi-email' }]
    };

    // Send via Resend API
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend API Error:', error);
      
    return new Response(JSON.stringify({
      success: false,
      error: `Email sending failed: ${error.message}`,
      details: error
    }), {
      status: 500,
      headers: corsHeaders
    });
    }
    
    return new Response(JSON.stringify({
      success: true,
      messageId: data.id,
      provider: 'resend'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
