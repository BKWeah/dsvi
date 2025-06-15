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
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY; // Use anon key since RLS is disabled

    // Debug environment variables
    console.log('DEBUG: Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      supabaseUrlLength: supabaseUrl?.length || 0,
      hasAnonKey: !!supabaseAnonKey,
      anonKeyLength: supabaseAnonKey?.length || 0,
      supabaseUrlPreview: supabaseUrl?.substring(0, 20) + '...',
      anonKeyPreview: supabaseAnonKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key not configured in environment');
    }

    // Initialize Supabase client with anon key (no RLS on email_settings table)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log('DEBUG: Supabase client initialized successfully');

    // Fetch active email settings from database
    console.log('DEBUG: Querying email_settings table...');
    const { data: emailSettings, error: dbError } = await supabase
      .from('email_settings')
      .select('*')
      .eq('is_active', true)
      .eq('provider', 'resend') // Ensure we get Resend settings
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('DEBUG: Query result:', {
      hasError: !!dbError,
      error: dbError,
      dataLength: emailSettings?.length || 0,
      data: emailSettings
    });

    // Remove .single() and handle array result instead
    const activeSettings = emailSettings && emailSettings.length > 0 ? emailSettings[0] : null;

    if (dbError || !activeSettings) {
      console.error('Database error fetching email settings:', dbError);
      console.error('Email settings data:', emailSettings);
      throw new Error('Failed to retrieve active email settings from database.');
    }

    const resendApiKey = activeSettings.api_key;
    if (!resendApiKey) {
      throw new Error('Resend API key not found in database settings.');
    }
    const resend = new Resend(resendApiKey);

    // Parse request body
    const { to, subject, html, from } = await request.json();

    // Resolve recipient emails for Resend
    const resendRecipients = [];
    const schoolIdsToResolve = new Set();

    // First, collect all school_ids that need resolution
    if (Array.isArray(to)) {
      for (const recipient of to) {
        if (recipient.recipient_type === 'school_admin' && recipient.school_id) {
          schoolIdsToResolve.add(recipient.school_id);
        }
      }
    }

    const schoolAdminEmailsMap = new Map();
    if (schoolIdsToResolve.size > 0) {
      // Fetch schools with their admin_user_id
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, admin_user_id')
        .in('id', Array.from(schoolIdsToResolve));

      if (schoolsError) {
        console.error('Error fetching schools for email resolution:', schoolsError);
        throw new Error('Failed to resolve school admin emails.');
      }

      const adminUserIds = schoolsData.map(s => s.admin_user_id).filter(Boolean);

      if (adminUserIds.length > 0) {
        // Fetch admin emails from the consolidated dsvi_admins table
        const { data: adminProfiles, error: profilesError } = await supabase
          .from('dsvi_admins') // Changed from 'profiles' to 'dsvi_admins'
          .select('user_id, email') // Select user_id instead of id, as dsvi_admins uses user_id for auth.users reference
          .in('user_id', adminUserIds); // Filter by user_id

        if (profilesError) {
          console.error('Error fetching admin profiles:', profilesError);
          throw profilesError;
        }

        const userEmailMap = new Map(adminProfiles.map(p => [p.user_id, p.email])); // Use user_id for the map key

        for (const school of schoolsData) {
          if (school.admin_user_id && userEmailMap.has(school.admin_user_id)) {
            schoolAdminEmailsMap.set(school.id, {
              email: userEmailMap.get(school.admin_user_id),
              name: school.name
            });
          }
        }
      }
    }

    // Now, build the final resendRecipients array
    if (Array.isArray(to)) {
      for (const recipient of to) {
        if (recipient.recipient_type === 'external') {
          if (recipient.recipient_email) { // Ensure email is not null
            resendRecipients.push({
              email: recipient.recipient_email,
              name: recipient.recipient_name || undefined
            });
          }
        } else if (recipient.recipient_type === 'school_admin' && recipient.school_id) {
          const resolved = schoolAdminEmailsMap.get(recipient.school_id);
          if (resolved?.email) {
            resendRecipients.push({
              email: resolved.email,
              name: resolved.name || undefined
            });
          } else {
            console.warn(`Could not resolve email for school admin: ${recipient.school_id}`);
          }
        }
      }
    } else if (typeof to === 'string') { // Handle single string 'to' (e.g., from test email)
      resendRecipients.push({ email: to, name: undefined });
    }

    // Validate required fields after resolution
    if (resendRecipients.length === 0 || !subject || !html) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields or no valid recipients after resolution.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Prepare email data for Resend
    const emailData = {
      from: from?.email || emailSettings.from_email,
      to: resendRecipients.map(r => r.email), // Removed non-null assertion
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
