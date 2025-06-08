/**
 * Cloudflare Pages Function for sending emails via Brevo SMTP
 * Simple, reliable implementation using native fetch and SMTP
 */

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

    // Get SMTP credentials from environment or use defaults
    const smtpConfig = {
      host: 'smtp-relay.brevo.com',
      port: 587,
      username: env.BREVO_SMTP_USERNAME || '[REDACTED_USERNAME]',
      password: env.BREVO_SMTP_PASSWORD || '[REDACTED_SECRET]',
      from_email: from?.email || 'noreply@dsvi.org',
      from_name: from?.name || 'DSVI Team'
    };

    // Create email using Brevo's Send API (simpler than SMTP)
    const emailData = {
      sender: {
        name: smtpConfig.from_name,
        email: smtpConfig.from_email
      },
      to: Array.isArray(to) ? to : [{ email: to }],
      subject: subject,
      htmlContent: html,
      tags: ['dsvi-email']
    };

    // Send via Brevo API
    const brevoApiKey = env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured in environment');
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API Error:', errorText);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Email sending failed: ${response.status} ${response.statusText}`,
        details: errorText
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      messageId: result.messageId,
      provider: 'brevo-smtp'
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
