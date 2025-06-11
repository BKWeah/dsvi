-- Quick check: Does invitation system exist in database?

SELECT 'Checking invitation system...' as status;

-- Check table exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'pending_admin_invitations'
) as table_exists;

-- Check function exists  
SELECT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'create_admin_invitation'
) as function_exists;

-- Count invitations (if table exists)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations')
        THEN (SELECT COUNT(*)::text FROM pending_admin_invitations)
        ELSE 'Table does not exist'
    END as invitation_count;
