-- Fix email_settings RLS policies to allow reading for testing
-- Date: 2025-06-07
-- Purpose: Allow authenticated users to read email settings for connection testing

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "email_settings_dsvi_admin_only" ON email_settings;

-- Create separate policies for read and write operations
-- Allow authenticated users to read email settings (for testing connections)
CREATE POLICY "email_settings_read_authenticated" ON email_settings 
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Only allow DSVI_ADMIN to insert/update/delete email settings
CREATE POLICY "email_settings_write_dsvi_admin_only" ON email_settings 
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "email_settings_update_dsvi_admin_only" ON email_settings 
FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "email_settings_delete_dsvi_admin_only" ON email_settings 
FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

SELECT 'Email settings RLS policies updated for better testing access!' as status;
