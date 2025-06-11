-- ===============================================================================
-- QUICK VERIFICATION - Level 2 Admin Flow (Run step by step)
-- ===============================================================================

-- STEP 1: Check if required functions exist
SELECT 'Functions Check:' as step;
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

-- STEP 2: Check if tables exist
SELECT 'Tables Check:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('dsvi_admins', 'pending_admin_invitations')
AND table_schema = 'public';

-- STEP 3: Check dsvi_admins table structure
SELECT 'dsvi_admins Structure:' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 4: Check current admin data
SELECT 'Current Admins:' as step;
SELECT user_id, email, name, admin_level, 
       array_length(permissions, 1) as perm_count,
       array_length(school_ids, 1) as school_count,
       is_active, created_at
FROM dsvi_admins 
ORDER BY created_at DESC
LIMIT 5;

-- STEP 5: Check pending invitations
SELECT 'Pending Invitations:' as step;
SELECT email, name, admin_level,
       array_length(permissions, 1) as perm_count,
       array_length(school_ids, 1) as school_count,
       is_used, created_at, expires_at
FROM pending_admin_invitations 
ORDER BY created_at DESC
LIMIT 5;
