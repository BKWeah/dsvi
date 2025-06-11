// ALTERNATIVE: Create Level 2 Admin Edge Function
// Place this in: supabase/functions/create-level2-admin/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const { email, password, name, inviteToken, permissions, schoolIds } = await req.json();

    if (!email || !password || !inviteToken) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: email, password, or inviteToken'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Create the user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: 'DSVI_ADMIN', name },
      email_confirm: true
    });

    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400
      });
    }

    // Create Level 2 admin records using the RPC function
    const { data: adminResult, error: adminError } = await supabaseAdmin.rpc('process_level2_admin_signup', {
      p_user_id: userData.user.id,
      p_email: email,
      p_invite_token: inviteToken
    });

    if (adminError) {
      // If admin creation fails, clean up the user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return new Response(JSON.stringify({ error: `Admin creation failed: ${adminError.message}` }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400
      });
    }

    return new Response(JSON.stringify({
      user: userData.user,
      adminResult: adminResult
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500
    });
  }
});
