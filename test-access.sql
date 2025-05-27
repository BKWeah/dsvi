-- QUICK TEST: Verify table access after fixes
-- Run this to test if your webapp should now work

-- Test basic table access (should work without authentication)
SELECT 'Testing public table access...' as test;

SELECT COUNT(*) as schools_count FROM schools;
SELECT COUNT(*) as pages_count FROM pages;  
SELECT COUNT(*) as requests_count FROM school_requests;

-- Test inserting a test school (should fail without proper auth - this is good)
-- INSERT INTO schools (name, slug) VALUES ('Test School', 'test-school');

-- Check current RLS status
SELECT 'Current RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('schools', 'pages', 'school_requests');

-- Check active policies
SELECT 'Active policies:' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('schools', 'pages', 'school_requests')
ORDER BY tablename, policyname;

SELECT '✅ If you see counts above, your webapp should work now!' as result;
