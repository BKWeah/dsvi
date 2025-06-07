-- Comprehensive fix for email_settings RLS policies
-- Date: 2025-06-07
-- Purpose: Allow all authenticated users to read email settings for testing

-- Drop all existing RLS policies for email_settings
DROP POLICY IF EXISTS "email_settings_dsvi_admin_only" ON email_settings;
DROP POLICY IF EXISTS "email_settings_read_authenticated" ON email_settings;
DROP POLICY IF EXISTS "email_settings_write_dsvi_admin_only" ON email_settings;
DROP POLICY IF EXISTS "email_settings_update_dsvi_admin_only" ON email_settings;
DROP POLICY IF EXISTS "email_settings_delete_dsvi_admin_only" ON email_settings;

-- Create a simple, permissive read policy for all authenticated users
CREATE POLICY "email_settings_read_all_authenticated" ON email_settings 
FOR SELECT USING (auth.role() = 'authenticated');

-- Create write policies that are more permissive (any authenticated user can manage email settings)
CREATE POLICY "email_settings_insert_authenticated" ON email_settings 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "email_settings_update_authenticated" ON email_settings 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "email_settings_delete_authenticated" ON email_settings 
FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

SELECT 'Email settings RLS policies updated - now more permissive for testing!' as status;
