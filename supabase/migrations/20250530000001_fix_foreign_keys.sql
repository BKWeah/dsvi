-- Fix Activity Logs Foreign Key Relationships (SIMPLIFIED)
-- Date: 2025-05-30
-- Purpose: Fix foreign key issues without relying on auth.users.user_metadata

-- First, let's check what exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'activity_logs' AND table_schema = 'public';

-- Drop existing foreign key constraints if they exist
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_school_id_fkey;

-- Create a simplified user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'SCHOOL_ADMIN',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles with simple policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies that don't rely on auth.users.user_metadata
CREATE POLICY "users_can_read_own_profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to read all profiles (simplified for now)
CREATE POLICY "authenticated_can_read_profiles" ON user_profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update profiles
CREATE POLICY "authenticated_can_manage_profiles" ON user_profiles
FOR ALL USING (auth.role() = 'authenticated');

-- Create proper foreign keys
ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

-- Update admin_school_assignments foreign keys
ALTER TABLE admin_school_assignments DROP CONSTRAINT IF EXISTS admin_school_assignments_school_admin_id_fkey;
ALTER TABLE admin_school_assignments DROP CONSTRAINT IF EXISTS admin_school_assignments_assigned_by_fkey;

ALTER TABLE admin_school_assignments 
ADD CONSTRAINT admin_school_assignments_school_admin_id_fkey 
FOREIGN KEY (school_admin_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE admin_school_assignments 
ADD CONSTRAINT admin_school_assignments_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create a function to manually sync user profiles (we'll call this from the app)
CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'SCHOOL_ADMIN',
  p_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, name)
  VALUES (p_user_id, p_email, p_role, COALESCE(p_name, p_email))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    updated_at = NOW();
  
  RETURN p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_school_id ON activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_admin_school_assignments_admin ON admin_school_assignments(school_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_school_assignments_school ON admin_school_assignments(school_id);

-- Insert a default DSVI admin profile for testing (you can update this with real data)
-- Note: Replace this UUID with your actual admin user ID
INSERT INTO user_profiles (id, email, role, name)
VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,  -- Replace with actual admin UUID
  'admin@dsvi.com',
  'DSVI_ADMIN',
  'DSVI Administrator'
) ON CONFLICT (id) DO NOTHING;

SELECT 'Foreign key relationships fixed successfully!' as result;
SELECT 'Remember to sync your existing users using the upsert_user_profile function!' as reminder;