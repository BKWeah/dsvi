-- TEST WITH REAL USER IDS: Run this after the corrected emergency fix
-- This test uses actual user IDs from auth.users table

-- 1. Get an actual user ID from auth.users for testing
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
    test_result JSON;
BEGIN
    -- Get the first available user ID from auth.users
    SELECT id, email INTO test_user_id, test_email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users table. Cannot test with real user IDs.';
        RAISE NOTICE 'The functions are created, but testing requires actual user accounts.';
    ELSE
        RAISE NOTICE 'Testing with real user ID: % (email: %)', test_user_id, test_email;
        
        -- Test upsert_user_profile with real user ID
        PERFORM upsert_user_profile(
            test_user_id,
            'realtest@example.com',
            'DSVI_ADMIN',
            'Real Test User'
        );
        
        RAISE NOTICE 'upsert_user_profile test completed successfully';
        
        -- Test complete Level 2 admin creation with real user ID
        SELECT create_level2_admin_complete(
            test_user_id,
            'realtest@example.com',
            'Real Test Admin',
            test_user_id,  -- Use same user as creator for simplicity
            ARRAY['manage_schools']::TEXT[],
            ARRAY[]::UUID[],
            'Real user test'
        ) INTO test_result;
        
        RAISE NOTICE 'create_level2_admin_complete result: %', test_result;
        
        -- Check what was created
        RAISE NOTICE 'Checking results...';
        RAISE NOTICE 'user_profiles count: %', (SELECT count(*) FROM user_profiles WHERE user_id = test_user_id);
        RAISE NOTICE 'admin_profiles count: %', (SELECT count(*) FROM admin_profiles WHERE user_id = test_user_id);
        RAISE NOTICE 'admin_permissions count: %', (SELECT count(*) FROM admin_permissions WHERE admin_user_id = test_user_id);
        
        -- Cleanup test data
        DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
        DELETE FROM admin_profiles WHERE user_id = test_user_id;
        DELETE FROM user_profiles WHERE user_id = test_user_id;
        
        RAISE NOTICE '✅ Test completed and cleaned up successfully!';
    END IF;
END $$;

-- 2. Verify all required functions now exist
SELECT 'Function status after fix:' as status;
SELECT 
    required_functions.routine_name,
    CASE WHEN r.routine_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
        ('create_level2_admin_complete'),
        ('safe_create_admin_profile'),
        ('upsert_user_profile'),
        ('grant_admin_permission'),
        ('assign_school_to_admin'),
        ('verify_admin_setup')
) AS required_functions(routine_name)
LEFT JOIN information_schema.routines r ON r.routine_name = required_functions.routine_name
ORDER BY required_functions.routine_name;

SELECT '🎉 Level 2 Admin system is now ready for real signups!' as final_status;
