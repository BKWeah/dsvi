import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  console.log('Received request method:', req.method);
  console.log('Request headers:', req.headers);

  try {
    const requestBody = await req.json();
    const { email, password, role, schoolData } = requestBody;

    console.log('Parsed request body:', { email, password: password ? '[REDACTED]' : 'N/A', role, schoolData });

    if (!email || !password || !role) {
      console.error('Missing required fields: email, password, or role');
      return new Response(JSON.stringify({ error: 'Missing email, password, or role' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    // For school admin creation, we also need school data
    if (role === 'SCHOOL_ADMIN' && !schoolData) {
      console.error('Missing school data for SCHOOL_ADMIN creation');
      return new Response(JSON.stringify({ error: 'School data is required for SCHOOL_ADMIN creation' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // Create the user first
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true,
    })

    if (userError) {
      console.error('Error creating user:', userError.message)
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    let school = null;

    // If creating a school admin, also create the school
    if (role === 'SCHOOL_ADMIN' && userData.user && schoolData) {
      const { data: schoolResult, error: schoolError } = await supabaseAdmin
        .from('schools')
        .insert({
          name: schoolData.name,
          slug: schoolData.slug,
          logo_url: schoolData.logo_url || null,
          admin_user_id: userData.user.id
        })
        .select()
        .single()

      if (schoolError) {
        console.error('Error creating school:', schoolError.message)
        // If school creation fails, we should delete the user to maintain consistency
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        return new Response(JSON.stringify({ error: `Failed to create school: ${schoolError.message}` }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 400,
        })
      }

      school = schoolResult;
      console.log('Successfully created school:', school);
    }

    return new Response(JSON.stringify({ 
      user: userData.user, 
      school: school 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error during JSON parsing or execution:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
