-- Quick check - run this first to verify basic setup

-- Check if key functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'create_admin_invitation',
    'get_invitation_by_token',
    'create_admin_from_invitation', 
    'get_admin_level_new',
    'get_admin_by_user_id'
) 
AND routine_schema = 'public';

-- Check if tables exist  
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('dsvi_admins', 'pending_admin_invitations')
AND table_schema = 'public';

-- Check current admin count
SELECT 
    'dsvi_admins' as table_name,
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE admin_level = 1) as level1_count,
    COUNT(*) FILTER (WHERE admin_level = 2) as level2_count
FROM dsvi_admins
UNION ALL
SELECT 
    'pending_invitations' as table_name,
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE is_used = false) as unused_count,
    COUNT(*) FILTER (WHERE is_used = true) as used_count
FROM pending_admin_invitations;
