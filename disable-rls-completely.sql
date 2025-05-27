-- QUICK FIX: Completely disable RLS for testing
-- This will make all tables fully accessible for now
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests DISABLE ROW LEVEL SECURITY;

-- Test that it works
SELECT 'RLS disabled - tables should now be fully accessible' as status;
SELECT COUNT(*) as school_count FROM schools;

-- Also disable on storage objects (if there are issues with file uploads)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

SELECT '✅ All RLS disabled - your app should work completely now!' as final_status;
