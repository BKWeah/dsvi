-- Test all Level 2 Admin functions manually
-- Run this in Supabase SQL Editor to verify functions work

-- 1. First, verify all functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%admin%'
ORDER BY routine_name;

-- 2. Test the safe_create_admin_profile function
SELECT safe_create_admin_profile(
    '12345678-1234-1234-1234-123456789012'::UUID,  -- dummy user_id
    2,  -- admin level 2
    '12345678-1234-1234-1234-123456789012'::UUID,  -- dummy created_by
    'Test admin profile creation'
) as profile_result;

-- 3. Test the grant_admin_permission function
SELECT grant_admin_permission(
    '12345678-1234-1234-1234-123456789012'::UUID,  -- dummy user_id
    'manage_schools',  -- permission type
    NULL,  -- resource_id
    '12345678-1234-1234-1234-123456789012'::UUID   -- granted_by
) as permission_result;

-- 4. Test the verify_admin_setup function
SELECT verify_admin_setup(
    '12345678-1234-1234-1234-123456789012'::UUID  -- dummy user_id
) as verification_result;

-- 5. Check if user_profiles table accepts inserts
INSERT INTO user_profiles (user_id, email, role, name) 
VALUES (
    '12345678-1234-1234-1234-123456789012'::UUID,
    'test@example.com',
    'DSVI_ADMIN',
    'Test User'
) 
ON CONFLICT (user_id) DO NOTHING;

-- 6. Verify the insert worked
SELECT * FROM user_profiles WHERE email = 'test@example.com';

-- 7. Test the comprehensive function with dummy data
SELECT create_level2_admin_complete(
    '87654321-4321-4321-4321-210987654321'::UUID,  -- different dummy user_id
    'test2@example.com',
    'Test Admin 2',
    '12345678-1234-1234-1234-123456789012'::UUID,  -- created_by
    ARRAY['manage_schools', 'view_reports']::TEXT[],  -- permissions
    ARRAY[]::UUID[],  -- no schools for test
    'Complete test of Level 2 admin creation'
) as complete_result;

-- 8. Check what was created
SELECT 'user_profiles:' as table_name, count(*) as count FROM user_profiles
UNION ALL
SELECT 'admin_profiles:', count(*) FROM admin_profiles
UNION ALL  
SELECT 'admin_permissions:', count(*) FROM admin_permissions
UNION ALL
SELECT 'admin_assignments:', count(*) FROM admin_assignments;

-- 9. View the actual data created
SELECT 'USER PROFILES:' as section;
SELECT * FROM user_profiles;

SELECT 'ADMIN PROFILES:' as section;
SELECT * FROM admin_profiles;

SELECT 'ADMIN PERMISSIONS:' as section;
SELECT * FROM admin_permissions;

SELECT 'ADMIN ASSIGNMENTS:' as section;
SELECT * FROM admin_assignments;
