-- PART 5: Test the main Level 2 admin creation function
SELECT 'Testing create_level2_admin_complete function...' as test_phase;

-- Test the main function
SELECT create_level2_admin_complete(
    '88888888-8888-8888-8888-888888888888'::UUID,
    'maintest@example.com',
    'Main Test Admin',
    '99999999-9999-9999-9999-999999999999'::UUID,
    ARRAY['manage_schools']::TEXT[],
    ARRAY[]::UUID[],
    'Test of main function'
) as function_result;

-- Check what was created
SELECT 'Results after main function test:' as check_phase;
SELECT count(*) as user_profiles_count FROM user_profiles WHERE email = 'maintest@example.com';
SELECT count(*) as admin_profiles_count FROM admin_profiles WHERE user_id = '88888888-8888-8888-8888-888888888888'::UUID;
SELECT count(*) as permissions_count FROM admin_permissions WHERE admin_user_id = '88888888-8888-8888-8888-888888888888'::UUID;

-- Cleanup test data
DELETE FROM admin_permissions WHERE admin_user_id = '88888888-8888-8888-8888-888888888888'::UUID;
DELETE FROM admin_profiles WHERE user_id = '88888888-8888-8888-8888-888888888888'::UUID;
DELETE FROM user_profiles WHERE email = 'maintest@example.com';

SELECT '✅ Tests completed!' as final_status;
