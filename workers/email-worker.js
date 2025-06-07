/**
 * Cloudflare Worker for Brevo Email API
 * This worker acts as a proxy to handle Brevo API requests
 * avoiding CORS issues when calling from the browser
 */

export default {
  async fetch(request, env) {
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Extract the Brevo API endpoint from the path
      // Example: /api/brevo/smtp/email -> https://api.brevo.com/v3/smtp/email
      if (!path.startsWith('/api/brevo/')) {
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const brevoEndpoint = path.replace('/api/brevo', '');
      const brevoUrl = `https://api.brevo.com/v3${brevoEndpoint}`;

      // Get the request body if present
      let body = null;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.text();
      }

      // Get API key from request header or environment variable
      let apiKey = request.headers.get('X-API-Key');
      
      // If no API key in header, use the one from environment
      if (!apiKey && env.BREVO_API_KEY) {
        apiKey = env.BREVO_API_KEY;
      }

      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not provided' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Forward the request to Brevo
      const brevoResponse = await fetch(brevoUrl, {
        method: request.method,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: body,
      });

      // Get the response from Brevo
      const responseData = await brevoResponse.text();

      // Return the response with CORS headers
      return new Response(responseData, {
        status: brevoResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Worker error', 
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
