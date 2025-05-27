-- DIAGNOSTIC SCRIPT: Check database permissions and policies
-- Run this in your Supabase SQL Editor to diagnose issues

-- 1. Check if tables exist and are accessible
SELECT 'Checking if tables exist...' as step;

SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('schools', 'pages', 'school_requests');

-- 2. Check RLS status
SELECT 'Checking RLS status...' as step;

SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('schools', 'pages', 'school_requests');

-- 3. Check existing policies
SELECT 'Checking RLS policies...' as step;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('schools', 'pages', 'school_requests')
ORDER BY tablename, policyname;

-- 4. Test direct table access (this should work for anon users)
SELECT 'Testing direct table access...' as step;

-- Try to count schools (should work with public policy)
SELECT COUNT(*) as total_schools FROM schools;

-- 5. Check storage bucket
SELECT 'Checking storage bucket...' as step;

SELECT id, name, public, owner FROM storage.buckets WHERE id = 'public';

-- Final status
SELECT 'Diagnostic completed!' as status;
