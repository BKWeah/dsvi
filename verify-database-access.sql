-- VERIFY: Test that your tables are now fully accessible
-- This should all work without any permission errors

-- Test reading (should work)
SELECT 'Testing table access...' as test;
SELECT COUNT(*) as school_count FROM schools;
SELECT COUNT(*) as page_count FROM pages;
SELECT COUNT(*) as request_count FROM school_requests;

-- Test writing (should work)  
INSERT INTO schools (name, slug, admin_user_id) 
VALUES ('Test School', 'test-school', NULL);

-- Verify the insert worked
SELECT 'After insert:' as test;
SELECT COUNT(*) as school_count FROM schools;
SELECT name, slug FROM schools WHERE slug = 'test-school';

-- Clean up the test
DELETE FROM schools WHERE slug = 'test-school';

SELECT '✅ All database operations working perfectly!' as final_result;
