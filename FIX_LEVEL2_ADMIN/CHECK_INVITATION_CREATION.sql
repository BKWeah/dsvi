-- ===============================================================================
-- FIX 1: CHECK WHY INVITATIONS AREN'T BEING SAVED
-- ===============================================================================

-- First, let's check if the create_admin_invitation function is working
DO $$
DECLARE
    test_result JSON;
    test_user_id UUID := auth.uid(); -- Use current user ID for testing
BEGIN
    -- Test the create_admin_invitation function
    SELECT create_admin_invitation(
        'test_invitation@example.com',
        'Test Admin Name',
        COALESCE(test_user_id, '00000000-0000-0000-0000-000000000000'::UUID),
        ARRAY['view_schools', 'manage_content']::TEXT[],
        ARRAY[]::UUID[],
        'Test invitation',
        7
    ) INTO test_result;
    
    RAISE NOTICE 'Create invitation result: %', test_result;
    
    -- Check if it was saved
    IF EXISTS (SELECT 1 FROM pending_admin_invitations WHERE email = 'test_invitation@example.com') THEN
        RAISE NOTICE '✅ Invitation saved to database';
        -- Clean up
        DELETE FROM pending_admin_invitations WHERE email = 'test_invitation@example.com';
    ELSE
        RAISE NOTICE '❌ Invitation NOT saved to database';
    END IF;
END $$;

-- Check if the function exists and its definition
SELECT 
    proname,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc
FROM pg_proc 
WHERE proname = 'create_admin_invitation';

-- Check table permissions
SELECT 
    tablename,
    has_table_privilege('authenticated', tablename, 'INSERT') as can_insert,
    has_table_privilege('authenticated', tablename, 'SELECT') as can_select
FROM pg_tables
WHERE tablename = 'pending_admin_invitations';

-- Check if RLS is enabled on pending_admin_invitations
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'pending_admin_invitations';
