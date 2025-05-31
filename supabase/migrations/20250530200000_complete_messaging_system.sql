-- ===============================================================================
-- DSVI Platform - Complete Messaging System Setup
-- Purpose: Finalize messaging system with default templates and permissions
-- ===============================================================================

-- Insert additional default templates if they don't exist
INSERT INTO message_templates (name, subject, body, template_type, variables, created_by) 
SELECT 
  'School Admin Invitation',
  'Welcome to DSVI - You''ve been assigned as School Administrator',
  'Hello {{admin_name}},

You have been assigned as the administrator for {{school_name}} in the DSVI platform.

Your login credentials:
- Email: {{admin_email}}
- Password: {{admin_password}}
- Portal URL: {{admin_portal_url}}

Your assigned schools:
{{assigned_schools}}

What you can do:
- Edit and manage content for your assigned schools
- Send messages to other school administrators (limited to your schools)
- Update your school''s branding and settings

If you have any questions, please contact our support team.

Best regards,
The DSVI Team',
  'custom',
  '["admin_name", "school_name", "admin_email", "admin_password", "admin_portal_url", "assigned_schools"]'::jsonb,
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates WHERE name = 'School Admin Invitation'
);

-- Insert subscription reminder template
INSERT INTO message_templates (name, subject, body, template_type, variables, created_by) 
SELECT 
  'Payment Overdue Notice',
  'URGENT: Payment Overdue for {{school_name}} - Action Required',
  'Hello {{school_name}},

Your DSVI subscription payment is overdue. To avoid service interruption, please settle your payment immediately.

Payment Details:
- Amount Due: ${{amount_due}}
- Due Date: {{due_date}}
- Days Overdue: {{days_overdue}}

What happens next if payment is not received:
- Day 7: Website access will be restricted
- Day 14: Website will be taken offline
- Day 30: All data will be permanently deleted

To make a payment or discuss payment options, please contact us immediately.

Urgent Contact: {{support_phone}}
Email: {{support_email}}

We value your partnership and want to help resolve this quickly.

Best regards,
The DSVI Team',
  'payment_overdue',
  '["school_name", "amount_due", "due_date", "days_overdue", "support_phone", "support_email"]'::jsonb,
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates WHERE name = 'Payment Overdue Notice'
);

-- Insert system update template
INSERT INTO message_templates (name, subject, body, template_type, variables, created_by) 
SELECT 
  'System Update Notification',
  'DSVI System Update - {{update_type}}',
  'Hello {{school_name}},

We wanted to inform you about an upcoming system update to improve your DSVI experience.

Update Details:
- Type: {{update_type}}
- Scheduled Date: {{update_date}}
- Expected Duration: {{update_duration}}
- Impact: {{update_impact}}

What to expect:
{{update_details}}

Preparation steps:
{{preparation_steps}}

If you have any questions about this update, please don''t hesitate to contact us.

Thank you for your patience as we continue to improve the platform.

Best regards,
The DSVI Team',
  'update_alert',
  '["school_name", "update_type", "update_date", "update_duration", "update_impact", "update_details", "preparation_steps"]'::jsonb,
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates WHERE name = 'System Update Notification'
);

-- Update RLS policies for messaging system to support level-based access
-- Allow School Admins to read messages sent to their assigned schools
CREATE POLICY "message_recipients_school_admin_assigned" ON message_recipients 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT school_id FROM admin_school_assignments 
    WHERE school_admin_id = auth.uid()
  )
);

-- Allow School Admins to create message recipients only for their assigned schools
CREATE POLICY "message_recipients_school_admin_create_assigned" ON message_recipients 
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  (school_id IS NULL OR school_id IN (
    SELECT school_id FROM admin_school_assignments 
    WHERE school_admin_id = auth.uid()
  ))
);

-- Update messages policy for School Admins to see messages sent to their schools
CREATE POLICY "messages_school_admin_received" ON messages 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  id IN (
    SELECT message_id FROM message_recipients mr
    WHERE mr.school_id IN (
      SELECT school_id FROM admin_school_assignments 
      WHERE school_admin_id = auth.uid()
    )
  )
);

-- Create function to get accessible schools based on user role
CREATE OR REPLACE FUNCTION get_accessible_schools_for_user()
RETURNS TABLE (
  id UUID,
  name TEXT
) AS $$
BEGIN
  -- Check if user is DSVI Admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN' THEN
    RETURN QUERY
    SELECT s.id, s.name
    FROM schools s
    ORDER BY s.name;
  
  -- Check if user is School Admin
  ELSIF (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' THEN
    RETURN QUERY
    SELECT s.id, s.name
    FROM schools s
    INNER JOIN admin_school_assignments asa ON s.id = asa.school_id
    WHERE asa.school_admin_id = auth.uid()
    ORDER BY s.name;
  
  ELSE
    -- Return empty result for other roles
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_accessible_schools_for_user() TO authenticated;

-- Create function to validate message recipient access
CREATE OR REPLACE FUNCTION validate_message_recipient_access(school_ids UUID[])
RETURNS BOOLEAN AS $$
DECLARE
  accessible_school_ids UUID[];
  unauthorized_count INTEGER;
BEGIN
  -- Get accessible schools for current user
  SELECT ARRAY(SELECT id FROM get_accessible_schools_for_user()) INTO accessible_school_ids;
  
  -- Count how many requested schools are not accessible
  SELECT COUNT(*) INTO unauthorized_count
  FROM UNNEST(school_ids) AS requested_id
  WHERE requested_id IS NOT NULL 
  AND requested_id NOT IN (SELECT UNNEST(accessible_school_ids));
  
  -- Return true if all requested schools are accessible
  RETURN unauthorized_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the validation function
GRANT EXECUTE ON FUNCTION validate_message_recipient_access(UUID[]) TO authenticated;

SELECT 'Messaging system setup completed successfully!' as status;
