-- ===============================================================================
-- STEP 1: CHECK CURRENT DATABASE STATE
-- Run this first to understand what's missing
-- ===============================================================================

-- Check if required tables exist
SELECT 
    'Tables Check' as check_type,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') as admin_profiles_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_permissions') as admin_permissions_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_assignments') as admin_assignments_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_school_assignments') as admin_school_assignments_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') as user_profiles_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') as pending_admin_invitations_exists;

-- Check if required functions exist
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
    'process_level2_admin_signup',
    'create_level2_admin_complete',
    'safe_create_admin_profile',
    'create_admin_profile',
    'grant_admin_permission',
    'assign_school_to_admin',
    'verify_admin_setup',
    'upsert_user_profile',
    'get_admin_level',
    'create_admin_invitation',
    'get_invitation_by_token',
    'mark_invitation_used'
)
ORDER BY proname;

-- Check existing admin users
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role,
    ap.admin_level,
    ap.is_active as admin_active
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
ORDER BY u.created_at DESC
LIMIT 10;

-- Check pending invitations
SELECT 
    id,
    email,
    name,
    invite_token,
    created_at,
    expires_at,
    is_used,
    used_at
FROM pending_admin_invitations
ORDER BY created_at DESC
LIMIT 5;
