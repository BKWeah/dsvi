-- Create a simple test template to verify messaging system works
INSERT INTO message_templates (name, subject, body, template_type, variables, is_active, created_by) 
VALUES (
  'Test Template',
  'Test Subject - Please Ignore',
  'This is a test template to verify the messaging system is working correctly.

Hello {{school_name}},

This is just a test message. Please ignore this email.

Best regards,
DSVI Team',
  'custom',
  '["school_name"]'::jsonb,
  true,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Also create a few more useful templates
INSERT INTO message_templates (name, subject, body, template_type, variables, is_active, created_by) 
VALUES (
  'System Maintenance Notice',
  'Scheduled Maintenance - {{maintenance_date}}',
  'Hello {{school_name}},

We will be performing scheduled maintenance on the DSVI platform on {{maintenance_date}} from {{start_time}} to {{end_time}}.

During this time, your school website and admin portal may be temporarily unavailable.

What to expect:
- Brief downtime of approximately {{duration}}
- All data will be preserved
- Normal service will resume after maintenance

We apologize for any inconvenience and appreciate your patience.

Best regards,
The DSVI Team',
  'update_alert',
  '["school_name", "maintenance_date", "start_time", "end_time", "duration"]'::jsonb,
  true,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

SELECT 'Test templates created successfully!' as status;
