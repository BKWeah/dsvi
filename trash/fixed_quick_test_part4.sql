-- PART 4: Test if upsert_user_profile function works
SELECT 'Testing upsert_user_profile function...' as test_phase;

-- Test the upsert_user_profile function
SELECT upsert_user_profile(
    '99999999-9999-9999-9999-999999999999'::UUID,
    'functiontest@example.com',
    'DSVI_ADMIN',
    'Function Test User'
);

-- Check if it created a record
SELECT 'Records created:' as result_check;
SELECT * FROM user_profiles WHERE email = 'functiontest@example.com';

-- Count all records in each table
SELECT 'user_profiles' as table_name, count(*) as record_count FROM user_profiles
UNION ALL
SELECT 'admin_profiles', count(*) FROM admin_profiles
UNION ALL  
SELECT 'admin_permissions', count(*) FROM admin_permissions
UNION ALL
SELECT 'admin_assignments', count(*) FROM admin_assignments;

-- Cleanup
DELETE FROM user_profiles WHERE email = 'functiontest@example.com';
