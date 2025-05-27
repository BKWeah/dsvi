-- SIMPLE RLS CHECK: Quick test to see RLS status
-- Run this for a quick overview

-- Check if RLS is enabled or disabled
SELECT 
    'schools' as table_name,
    CASE WHEN rowsecurity THEN '❌ RLS ENABLED' ELSE '✅ RLS DISABLED' END as status
FROM pg_tables WHERE tablename = 'schools'
UNION ALL
SELECT 
    'pages' as table_name,
    CASE WHEN rowsecurity THEN '❌ RLS ENABLED' ELSE '✅ RLS DISABLED' END as status  
FROM pg_tables WHERE tablename = 'pages'
UNION ALL
SELECT 
    'school_requests' as table_name,
    CASE WHEN rowsecurity THEN '❌ RLS ENABLED' ELSE '✅ RLS DISABLED' END as status
FROM pg_tables WHERE tablename = 'school_requests';

-- Quick access test
SELECT 'ACCESS TEST' as test, COUNT(*) as school_requests_count FROM school_requests;
