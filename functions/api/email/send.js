/**
 * Cloudflare Pages Function for sending emails via Resend
 * Simple, reliable implementation using native fetch and Resend API
 */

import { Resend } from 'resend';

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

    // Initialize Resend with API key from environment
    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured in environment');
    }
    const resend = new Resend(resendApiKey);

    // Prepare email data for Resend
    const emailData = {
      from: from?.email || 'onboarding@libdsvi.com', // Resend requires a verified sender domain
      to: Array.isArray(to) ? to.map(recipient => recipient.email) : [to], // Resend 'to' expects an array of strings
      subject: subject,
      html: html,
      tags: [{ name: 'category', value: 'dsvi-email' }] // Resend tags format
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
