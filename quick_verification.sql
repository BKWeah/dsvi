-- Quick verification of core Level 2 admin functions
-- Run this to verify the flow works

-- Check if required functions exist
SELECT 'Functions check:' as status;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'create_admin_invitation',
    'get_invitation_by_token',
    'create_admin_from_invitation',
    'get_admin_level_new',
    'get_admin_by_user_id'
) 
ORDER BY routine_name;

-- Check table structures
SELECT 'Tables check:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('dsvi_admins', 'pending_admin_invitations')
AND table_schema = 'public';

-- Check if dsvi_admins table has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins' 
ORDER BY ordinal_position;
