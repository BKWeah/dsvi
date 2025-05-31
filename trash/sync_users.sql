-- Manual User Profile Sync Script
-- Run this after the migration to sync existing users

-- First, let's see what users we have in auth.users (if accessible)
-- Note: You may need to run this through the Supabase dashboard

-- Insert your actual admin user ID here (get it from Supabase Auth dashboard)
-- Replace the UUID below with your actual admin user ID
INSERT INTO user_profiles (id, email, role, name)
VALUES (
  'REPLACE_WITH_YOUR_ADMIN_UUID'::UUID,  -- Get this from Supabase Auth dashboard
  'your-admin-email@example.com',        -- Your admin email
  'DSVI_ADMIN',
  'Your Admin Name'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = NOW();

-- Add more users as needed:
-- INSERT INTO user_profiles (id, email, role, name)
-- VALUES (
--   'ANOTHER_USER_UUID'::UUID,
--   'school-admin@example.com',
--   'SCHOOL_ADMIN', 
--   'School Admin Name'
-- ) ON CONFLICT (id) DO NOTHING;

SELECT 'User profiles synced!' as result;
SELECT * FROM user_profiles ORDER BY created_at;