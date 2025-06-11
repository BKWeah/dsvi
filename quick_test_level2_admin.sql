-- QUICK TEST: Level 2 Admin System
-- Run this to quickly test if everything is working

-- 1. Check all required tables exist
SELECT 
    'user_profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'admin_profiles', 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'admin_permissions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_permissions') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'admin_assignments',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_assignments') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END;

-- 2. Check all required functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
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

-- 3. Test user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Quick function test (this should work without errors)
SELECT 'Testing functions...' as test_phase;

-- Test creating a test admin (use debug function if available)
DO $$
DECLARE
    test_result JSON;
BEGIN
    -- Try the debug function first
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'debug_create_level2_admin_complete') THEN
        SELECT debug_create_level2_admin_complete(
            '99999999-9999-9999-9999-999999999999'::UUID,
            'quicktest@example.com',
            'Quick Test Admin',
            '99999999-9999-9999-9999-999999999999'::UUID,
            ARRAY['manage_schools']::TEXT[],
            ARRAY[]::UUID[],
            'Quick test admin'
        ) INTO test_result;
        RAISE NOTICE 'DEBUG FUNCTION TEST RESULT: %', test_result;
    ELSE
        RAISE NOTICE 'Debug function not available, testing regular function...';
        SELECT create_level2_admin_complete(
            '99999999-9999-9999-9999-999999999999'::UUID,
            'quicktest@example.com',
            'Quick Test Admin',
            '99999999-9999-9999-9999-999999999999'::UUID,
            ARRAY['manage_schools']::TEXT[],
            ARRAY[]::UUID[],
            'Quick test admin'
        ) INTO test_result;
        RAISE NOTICE 'REGULAR FUNCTION TEST RESULT: %', test_result;
    END IF;
END $$;

-- 5. Check what was created
SELECT 'Results after test:' as check_phase;
SELECT 'user_profiles:', count(*) FROM user_profiles WHERE email LIKE '%quicktest%';
SELECT 'admin_profiles:', count(*) FROM admin_profiles WHERE notes LIKE '%Quick test%';
SELECT 'admin_permissions:', count(*) FROM admin_permissions WHERE admin_user_id = '99999999-9999-9999-9999-999999999999'::UUID;

-- 6. Cleanup test data
DELETE FROM admin_permissions WHERE admin_user_id = '99999999-9999-9999-9999-999999999999'::UUID;
DELETE FROM admin_profiles WHERE user_id = '99999999-9999-9999-9999-999999999999'::UUID;
DELETE FROM user_profiles WHERE email = 'quicktest@example.com';

SELECT '✅ Quick test completed! Check the NOTICES above for detailed results.' as final_status;
