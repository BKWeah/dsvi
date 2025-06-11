-- Test Script: Verify Level 2 Admin Fix
-- Run this in Supabase SQL Editor after applying migrations

-- 1. Verify all required functions exist
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN (
            'safe_create_admin_profile',
            'verify_admin_setup', 
            'create_level2_admin_complete',
            'grant_admin_permission',
            'assign_school_to_admin'
        ) THEN '✅ REQUIRED'
        ELSE '❓ OTHER'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%admin%'
ORDER BY routine_name;

-- 2. Verify user_profiles table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check admin_profiles table structure
SELECT COUNT(*) as admin_profiles_count FROM admin_profiles;

-- 4. Check admin_permissions table structure  
SELECT COUNT(*) as admin_permissions_count FROM admin_permissions;

-- 5. Check admin_assignments table structure
SELECT COUNT(*) as admin_assignments_count FROM admin_assignments;

-- 6. Test the main function (replace with actual values for testing)
-- SELECT create_level2_admin_complete(
--     'test-user-id'::UUID,
--     'test@example.com',
--     'Test Admin',
--     'creator-user-id'::UUID,
--     ARRAY['manage_schools', 'view_reports'],
--     ARRAY['school-id-1'::UUID, 'school-id-2'::UUID],
--     'Test admin created for verification'
-- );

SELECT 'Database structure verification complete!' as result;
