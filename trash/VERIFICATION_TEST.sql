-- VERIFICATION TEST: Run this after applying the emergency fix
-- This should work without errors

-- 1. Verify all functions now exist
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

-- 2. Test the fixed upsert_user_profile function
SELECT upsert_user_profile(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    'verification@example.com',
    'DSVI_ADMIN',
    'Verification User'
);

-- 3. Test complete Level 2 admin creation
SELECT create_level2_admin_complete(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    'level2test@example.com',
    'Level 2 Test Admin',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    ARRAY['manage_schools', 'view_reports']::TEXT[],
    ARRAY[]::UUID[],
    'Final verification test'
) as verification_result;

-- 4. Check results
SELECT 'VERIFICATION RESULTS:' as section;
SELECT 'user_profiles:', count(*) FROM user_profiles WHERE email LIKE '%test%';
SELECT 'admin_profiles:', count(*) FROM admin_profiles WHERE notes LIKE '%verification%';
SELECT 'admin_permissions:', count(*) FROM admin_permissions WHERE admin_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;

-- 5. Cleanup
DELETE FROM admin_permissions WHERE admin_user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID);
DELETE FROM admin_profiles WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID);
DELETE FROM user_profiles WHERE email IN ('verification@example.com', 'level2test@example.com');

SELECT '✅ VERIFICATION COMPLETE - Level 2 Admin system should now work!' as final_status;
