-- ===============================================================================
-- DSVI Platform - Messaging System Migration
-- Date: 2025-05-30
-- Purpose: Add comprehensive messaging and email integration system
-- ===============================================================================

-- Create message_templates table for reusable email templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('welcome', 'expiry_warning', 'expired', 'renewal_success', 'payment_overdue', 'update_alert', 'custom')),
  variables JSONB DEFAULT '[]'::jsonb, -- Available template variables
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table for storing all sent messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'email' CHECK (message_type IN ('email', 'in_app', 'sms')),
  template_id UUID REFERENCES message_templates(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_provider TEXT, -- 'sendgrid', 'ses', 'resend', etc.
  delivery_id TEXT, -- External provider message ID
  delivery_response JSONB, -- Full response from delivery provider
  error_message TEXT,
  total_recipients INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_recipients table for tracking individual recipients
CREATE TABLE IF NOT EXISTS message_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_type TEXT DEFAULT 'school_admin' CHECK (recipient_type IN ('school_admin', 'dsvi_admin', 'external')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  error_message TEXT,
  delivery_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email_settings table for SMTP/provider configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('sendgrid', 'ses', 'resend', 'smtp')),
  api_key TEXT, -- Encrypted API key
  api_secret TEXT, -- Encrypted API secret
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT, -- Encrypted password
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to_email TEXT,
  is_active BOOLEAN DEFAULT false,
  test_mode BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create automated_messaging table for scheduled/triggered messages
CREATE TABLE IF NOT EXISTS automated_messaging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('subscription_expiry', 'payment_overdue', 'welcome', 'renewal_success')),
  template_id UUID REFERENCES message_templates(id) NOT NULL,
  trigger_days_before INTEGER, -- For expiry warnings (e.g., 14, 7, 1)
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_school ON message_recipients(school_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_status ON message_recipients(delivery_status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_email ON message_recipients(recipient_email);
CREATE INDEX IF NOT EXISTS idx_automated_messaging_trigger ON automated_messaging(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automated_messaging_active ON automated_messaging(is_active);

-- Enable RLS on new tables
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_messaging ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "message_templates_dsvi_admin_all" ON message_templates 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "message_templates_school_admin_read" ON message_templates 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  is_active = true
);

-- RLS Policies for messages
CREATE POLICY "messages_dsvi_admin_all" ON messages 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "messages_school_admin_sent" ON messages 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  sender_id = auth.uid()
);

CREATE POLICY "messages_school_admin_create" ON messages 
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  sender_id = auth.uid()
);

-- RLS Policies for message_recipients  
CREATE POLICY "message_recipients_dsvi_admin_all" ON message_recipients 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "message_recipients_school_admin_read" ON message_recipients 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT id FROM schools WHERE admin_user_id = auth.uid()
  )
);

-- RLS Policies for email_settings (DSVI Admin only)
CREATE POLICY "email_settings_dsvi_admin_only" ON email_settings 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- RLS Policies for automated_messaging (DSVI Admin only)
CREATE POLICY "automated_messaging_dsvi_admin_only" ON automated_messaging 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- Create function to get messaging statistics
CREATE OR REPLACE FUNCTION get_messaging_stats()
RETURNS TABLE (
  total_messages BIGINT,
  sent_messages BIGINT,
  pending_messages BIGINT,
  failed_messages BIGINT,
  total_templates BIGINT,
  active_templates BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE status = 'sent') as sent_messages,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_messages,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_messages,
    (SELECT COUNT(*) FROM message_templates) as total_templates,
    (SELECT COUNT(*) FROM message_templates WHERE is_active = true) as active_templates
  FROM messages;
END;
$$ LANGUAGE plpgsql;

-- Create function to process automated messaging
CREATE OR REPLACE FUNCTION process_automated_messaging()
RETURNS INTEGER AS $$
DECLARE
  automation_record RECORD;
  schools_to_notify RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- Process subscription expiry warnings
  FOR automation_record IN 
    SELECT am.*, mt.subject, mt.body 
    FROM automated_messaging am
    JOIN message_templates mt ON am.template_id = mt.id
    WHERE am.is_active = true 
    AND am.trigger_type = 'subscription_expiry'
    AND (am.next_run_at IS NULL OR am.next_run_at <= NOW())
  LOOP
    -- Find schools that need expiry warnings
    FOR schools_to_notify IN
      SELECT s.id, s.name, s.subscription_end, s.contact_info
      FROM schools s
      WHERE s.subscription_end IS NOT NULL
      AND s.subscription_end = CURRENT_DATE + (automation_record.trigger_days_before || ' days')::INTERVAL
      AND s.subscription_status = 'active'
    LOOP
      -- Create message record
      INSERT INTO messages (
        sender_id, subject, body, message_type, template_id, 
        total_recipients, status
      ) VALUES (
        automation_record.created_by,
        automation_record.subject,
        automation_record.body,
        'email',
        automation_record.template_id,
        1,
        'pending'
      );
      
      processed_count := processed_count + 1;
    END LOOP;
    
    -- Update next run time
    UPDATE automated_messaging 
    SET 
      last_run_at = NOW(),
      next_run_at = NOW() + INTERVAL '1 day'
    WHERE id = automation_record.id;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default message templates
INSERT INTO message_templates (name, subject, body, template_type, variables, created_by) VALUES
('Welcome Email', 'Welcome to DSVI - Your School Website is Ready!', 
'Hello {{school_name}},

Welcome to the Digital School Visibility Initiative! We''re excited to have you on board.

Your school website has been successfully created and is now live at: {{school_url}}

Your login credentials:
- Username: {{admin_email}}
- Password: {{admin_password}}
- Admin Portal: {{admin_portal_url}}

Next Steps:
1. Log in to your admin portal
2. Customize your school''s content and branding
3. Add your school''s information and photos

If you need any assistance, please don''t hesitate to contact our support team.

Best regards,
The DSVI Team', 
'welcome', 
'["school_name", "school_url", "admin_email", "admin_password", "admin_portal_url"]'::jsonb, 
(SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),

('Subscription Expiry Warning', 'Your DSVI Subscription Expires in {{days_until_expiry}} Days', 
'Hello {{school_name}},

This is a friendly reminder that your DSVI subscription will expire on {{expiry_date}} ({{days_until_expiry}} days from now).

Current Package: {{package_type}}
Subscription End Date: {{expiry_date}}

To ensure uninterrupted service, please renew your subscription before the expiry date. You can:
- Contact our team for renewal assistance
- Log in to your admin portal to manage your subscription

If you have any questions about renewal or would like to upgrade your package, please reach out to us.

Thank you for being part of the DSVI community!

Best regards,
The DSVI Team', 
'expiry_warning', 
'["school_name", "days_until_expiry", "expiry_date", "package_type"]'::jsonb, 
(SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),

('Subscription Expired', 'Your DSVI Subscription has Expired', 
'Hello {{school_name}},

Your DSVI subscription expired on {{expiry_date}}. To restore access to your school website and admin portal, please renew your subscription as soon as possible.

What happens next:
- Your website will remain live for 7 days
- Admin portal access has been suspended
- After 7 days, your website may be temporarily disabled

To renew immediately:
1. Contact our support team
2. We''ll help you restore access quickly

Don''t lose your online presence - renew today!

Best regards,
The DSVI Team', 
'expired', 
'["school_name", "expiry_date"]'::jsonb, 
(SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),

('Renewal Success', 'Your DSVI Subscription has been Renewed Successfully!', 
'Hello {{school_name}},

Great news! Your DSVI subscription has been successfully renewed.

Renewal Details:
- Package: {{package_type}}
- New Expiry Date: {{new_expiry_date}}
- Amount Paid: ${{amount_paid}}

Your school website and admin portal access will continue uninterrupted. Thank you for your continued trust in DSVI!

If you have any questions about your renewed subscription, please don''t hesitate to contact us.

Best regards,
The DSVI Team', 
'renewal_success', 
'["school_name", "package_type", "new_expiry_date", "amount_paid"]'::jsonb, 
(SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1))

ON CONFLICT DO NOTHING;

SELECT 'Messaging system created successfully!' as status;
