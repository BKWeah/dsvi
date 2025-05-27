-- CHECK RLS STATUS: Verify if RLS is actually disabled
-- Run this to see the current state of your tables

SELECT 'Checking RLS status for all tables...' as step;

-- Check RLS status for each table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '❌ RLS ENABLED' 
        ELSE '✅ RLS DISABLED' 
    END as status
FROM pg_tables 
WHERE tablename IN ('schools', 'pages', 'school_requests')
ORDER BY tablename;

-- Check if there are any active policies (there shouldn't be any if RLS is disabled)
SELECT 'Checking for active policies...' as step;

SELECT 
    tablename,
    policyname,
    cmd as policy_type
FROM pg_policies 
WHERE tablename IN ('schools', 'pages', 'school_requests')
ORDER BY tablename, policyname;

-- Test direct access to each table
SELECT 'Testing direct table access...' as step;

SELECT 'schools' as table_name, COUNT(*) as row_count FROM schools
UNION ALL
SELECT 'pages' as table_name, COUNT(*) as row_count FROM pages  
UNION ALL
SELECT 'school_requests' as table_name, COUNT(*) as row_count FROM school_requests;

SELECT 'Diagnostic completed!' as status;
