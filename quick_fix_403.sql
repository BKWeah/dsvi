-- IMMEDIATE FIX FOR 403 ERRORS
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS completely on problematic tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 2. Grant full permissions
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT ALL ON activity_logs TO authenticated, anon;

-- 3. Verify fix
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'activity_logs');
