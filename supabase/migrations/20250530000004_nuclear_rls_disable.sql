-- NUCLEAR RLS DISABLE - Direct approach
-- Date: 2025-05-30
-- Purpose: Completely disable RLS on problematic tables

-- Drop all policies first
DROP POLICY IF EXISTS "users_can_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_can_read_profiles" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_can_manage_profiles" ON user_profiles;
DROP POLICY IF EXISTS "activity_logs_read_authenticated" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_authenticated" ON activity_logs;

-- Force disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_school_assignments DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'activity_logs', 'admin_school_assignments')
ORDER BY tablename;

SELECT 'RLS forcefully disabled on all tables!' as result;