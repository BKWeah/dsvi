// supabase/functions/send-message-trigger.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// This is the URL of your deployed Cloudflare Pages Function.
// You MUST set this as an environment variable in your Supabase project for the Edge Function.
// Example: https://your-cloudflare-pages-domain.com/api/email/send
const CLOUDFLARE_EMAIL_SEND_URL = Deno.env.get('CLOUDFLARE_EMAIL_SEND_URL');

serve(async (req) => {
  let initialPayload: any; // Declare initialPayload here

  try {
    initialPayload = await req.json(); // Assign to initialPayload
    console.log('Supabase Trigger Payload:', initialPayload);

    // Ensure this is an INSERT operation on the messages table
    if (initialPayload.type !== 'INSERT' || initialPayload.table !== 'messages') {
      return new Response('Not an insert operation on messages table', { status: 200 });
    }

    const newMessage = initialPayload.record;
    const messageId = newMessage.id;

    if (!messageId) {
      return new Response('Message ID not found in payload', { status: 400 });
    }

    if (!CLOUDFLARE_EMAIL_SEND_URL) {
      console.error('CLOUDFLARE_EMAIL_SEND_URL environment variable is not set.');
      return new Response('CLOUDFLARE_EMAIL_SEND_URL is not configured.', { status: 500 });
    }

    // Initialize Supabase client for the Edge Function
    // Use SUPABASE_SERVICE_ROLE_KEY for elevated privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
    );

    // Fetch message details
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .select('id, subject, body, sender_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      console.error('Error fetching message:', messageError);
      // Update message status to 'failed' if message cannot be fetched
      await supabaseClient
        .from('messages')
        .update({ status: 'failed', error_message: `Failed to fetch message: ${messageError?.message || 'Not found'}` })
        .eq('id', messageId);
      return new Response(`Error fetching message: ${messageError?.message || 'Not found'}`, { status: 500 });
    }

    // Fetch recipients for the message
    const { data: recipientsData, error: recipientsError } = await supabaseClient
      .from('message_recipients')
      .select('recipient_type, school_id, recipient_email, recipient_name')
      .eq('message_id', messageId);

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError);
      // Update message status to 'failed' if recipients cannot be fetched
      await supabaseClient
        .from('messages')
        .update({ status: 'failed', error_message: `Failed to fetch recipients: ${recipientsError.message}` })
        .eq('id', messageId);
      return new Response(`Error fetching recipients: ${recipientsError.message}`, { status: 500 });
    }

    const resendRecipients: Array<{ email: string; name?: string }> = [];
    const schoolIdsToResolve = new Set<string>();

    for (const recipient of recipientsData) {
      if (recipient.recipient_type === 'external') {
        if (recipient.recipient_email) {
          resendRecipients.push({
            email: recipient.recipient_email,
            name: recipient.recipient_name || undefined
          });
        }
      } else if (recipient.recipient_type === 'school_admin' && recipient.school_id) {
        schoolIdsToResolve.add(recipient.school_id);
      }
    }

    // Resolve school admin emails if any
    if (schoolIdsToResolve.size > 0) {
      const { data: schoolsData, error: schoolsError } = await supabaseClient
        .from('schools')
        .select('id, name, admin_user_id')
        .in('id', Array.from(schoolIdsToResolve));

      if (schoolsError) {
        console.error('Error fetching schools for email resolution:', schoolsError);
        // Update message status to 'failed' if school resolution fails
        await supabaseClient
          .from('messages')
          .update({ status: 'failed', error_message: `Failed to resolve school admin emails: ${schoolsError.message}` })
          .eq('id', messageId);
        return new Response(`Failed to resolve school admin emails: ${schoolsError.message}`, { status: 500 });
      }

      const adminUserIds = schoolsData.map(s => s.admin_user_id).filter(Boolean);

      if (adminUserIds.length > 0) {
        const { data: adminProfiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('id, email')
          .in('id', adminUserIds);

        if (profilesError) {
          console.error('Error fetching admin profiles:', profilesError);
          // Update message status to 'failed' if admin profiles cannot be fetched
          await supabaseClient
            .from('messages')
            .update({ status: 'failed', error_message: `Failed to fetch admin profiles: ${profilesError.message}` })
            .eq('id', messageId);
          return new Response(`Error fetching admin profiles: ${profilesError.message}`, { status: 500 });
        }

        const userEmailMap = new Map(adminProfiles.map(p => [p.id, p.email]));

        for (const school of schoolsData) {
          if (school.admin_user_id && userEmailMap.has(school.admin_user_id)) {
            resendRecipients.push({
              email: userEmailMap.get(school.admin_user_id),
              name: school.name
            });
          } else {
            console.warn(`Could not resolve email for school admin: ${school.id}`);
          }
        }
      }
    }

    if (resendRecipients.length === 0) {
      console.warn(`No valid recipients found for message ${messageId}. Email not sent.`);
      // Update message status to 'failed' if no valid recipients
      await supabaseClient
        .from('messages')
        .update({ status: 'failed', error_message: 'No valid recipients found. Email not sent.' })
        .eq('id', messageId);
      return new Response('No valid recipients found. Email not sent.', { status: 200 });
    }

    // Prepare payload for Cloudflare Pages Function
    const emailPayload = {
      to: resendRecipients.map(r => ({ email: r.email, name: r.name })),
      subject: message.subject,
      html: message.body,
      // The 'from' address will be resolved by the Cloudflare Pages Function
      // from: { email: 'onboarding@libdsvi.com', name: 'DSVI' } // Or fetch from settings if needed
    };

    console.log('Sending email payload to Cloudflare Pages Function:', emailPayload);

    // Make HTTP request to Cloudflare Pages Function
    const cfResponse = await fetch(CLOUDFLARE_EMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authorization headers if your Cloudflare Function requires them
      },
      body: JSON.stringify(emailPayload),
    });

    const cfResult = await cfResponse.json();

    if (!cfResponse.ok || !cfResult.success) {
      console.error('Cloudflare Pages Function failed:', cfResult.error || cfResponse.statusText);
      // Update message status to 'failed' in Supabase
      await supabaseClient
        .from('messages')
        .update({ status: 'failed', error_message: cfResult.error || 'Unknown error from Cloudflare Function' })
        .eq('id', messageId);
      return new Response(`Cloudflare Pages Function failed: ${cfResult.error || 'Unknown error'}`, { status: 500 });
    }

    console.log('Email successfully triggered via Cloudflare Pages Function:', cfResult);
    // Update message status to 'sent' in Supabase
    await supabaseClient
      .from('messages')
      .update({ status: 'sent', delivery_id: cfResult.messageId, delivery_provider: 'resend' })
      .eq('id', messageId);

    return new Response('Email send triggered successfully', { status: 200 });

  } catch (error: any) {
    console.error('Edge Function error:', error);
    // Attempt to update message status to 'failed' if an unexpected error occurs
    if (initialPayload?.record?.id) { // Use initialPayload here
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
      );
      await supabaseClient
        .from('messages')
        .update({ status: 'failed', error_message: `Edge Function internal error: ${error.message as string}` }) // Cast to string
        .eq('id', initialPayload.record.id);
    }
    return new Response(`Edge Function error: ${error.message}`, { status: 500 });
  }
});
