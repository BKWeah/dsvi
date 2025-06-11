-- ===============================================================================
-- QUICK VERIFICATION: Check if everything is working
-- ===============================================================================

-- 1. Check recent invitations
SELECT 
    id,
    email,
    name,
    invite_token,
    array_length(permissions, 1) as permission_count,
    array_length(school_ids, 1) as school_count,
    created_at,
    expires_at,
    is_used
FROM pending_admin_invitations
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check recent Level 2 admins with their setup
SELECT 
    u.email,
    u.created_at,
    up.name,
    ap.admin_level,
    COUNT(DISTINCT perm.id) as permissions,
    COUNT(DISTINCT aa.id) as schools_assigned,
    COUNT(DISTINCT asa.id) as school_assignments_alt
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN admin_permissions perm ON perm.admin_user_id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
LEFT JOIN admin_school_assignments asa ON asa.admin_user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
  AND ap.admin_level = 2
GROUP BY u.id, u.email, u.created_at, up.name, ap.admin_level
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Test invitation creation
DO $$
DECLARE
    result JSON;
BEGIN
    SELECT create_admin_invitation(
        'verify_test@example.com',
        'Verification Test Admin',
        auth.uid(),
        ARRAY['view_schools', 'manage_content']::TEXT[],
        ARRAY[]::UUID[],
        'Verification test',
        7
    ) INTO result;
    
    RAISE NOTICE 'Invitation creation result: %', result;
    
    -- Cleanup
    DELETE FROM pending_admin_invitations WHERE email = 'verify_test@example.com';
END $$;
