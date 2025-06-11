-- Quick debug: Check what's failing in create_admin_from_invitation

-- 1. Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'create_admin_from_invitation';

-- 2. Check current invitation
SELECT email, invite_token, is_used, expires_at > NOW() as not_expired
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';

-- 3. Test the function with error details
DO $$
DECLARE
    token TEXT;
    user_id UUID := gen_random_uuid();
    result JSON;
BEGIN
    SELECT invite_token INTO token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' AND is_used = false;
    
    RAISE NOTICE 'Token: %, User ID: %', token, user_id;
    
    SELECT create_admin_from_invitation(user_id, token) INTO result;
    RAISE NOTICE 'Result: %', result;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: % (Code: %)', SQLERRM, SQLSTATE;
END $$;
