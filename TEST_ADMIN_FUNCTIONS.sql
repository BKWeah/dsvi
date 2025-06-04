-- Test Admin Level System Functions
-- This script tests the admin level functions to ensure they're working correctly

-- Test 1: Check current DSVI admin users and their admin levels
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data->>'role' as role,
    COALESCE(ap.admin_level, 0) as admin_level,
    ap.created_at as profile_created_at,
    ap.notes
FROM auth.users au
LEFT JOIN admin_profiles ap ON au.id = ap.user_id
WHERE au.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
ORDER BY au.email;

-- Test 2: Check admin permissions table
SELECT 
    ap.admin_user_id,
    au.email,
    ap.permission_type,
    ap.resource_id,
    ap.is_active,
    ap.created_at
FROM admin_permissions ap
JOIN auth.users au ON ap.admin_user_id = au.id
ORDER BY au.email, ap.permission_type;

-- Test 3: Check admin assignments table
SELECT 
    aa.admin_user_id,
    au.email,
    aa.school_id,
    s.name as school_name,
    aa.is_active,
    aa.created_at
FROM admin_assignments aa
JOIN auth.users au ON aa.admin_user_id = au.id
LEFT JOIN schools s ON aa.school_id = s.id
ORDER BY au.email, s.name;

-- Test 4: Function to check admin level for specific user
-- Usage: SELECT get_admin_level('your-user-id-here'::UUID);

-- Test 5: Function to check permissions for specific user
-- Usage: SELECT has_admin_permission('your-user-id-here'::UUID, 'CMS_ACCESS');
