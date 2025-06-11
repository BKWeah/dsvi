-- Debug the admin creation failure step by step

-- Step 1: Check if the function exists
SELECT 'create_admin_from_invitation function check:' as step;
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_admin_from_invitation'
AND routine_schema = 'public';

-- Step 2: Check what invitation data we have
SELECT 'Current invitation data:' as step;
SELECT 
    id, email, name, invite_token, admin_level, permissions, school_ids,
    is_used, expires_at, created_at
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- Step 3: Test the function manually with detailed error handling
DO $$
DECLARE
    invitation_token TEXT;
    test_user_id UUID := gen_random_uuid();
    admin_creation_result JSON;
    invitation_record RECORD;
BEGIN
    -- Get the invitation token
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' 
    AND is_used = false
    LIMIT 1;
    
    RAISE NOTICE 'Using invitation token: %', invitation_token;
    RAISE NOTICE 'Using test user ID: %', test_user_id;
    
    -- Check if invitation exists before calling function
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = invitation_token
    AND expires_at > NOW()
    AND is_used = FALSE;
    
    IF FOUND THEN
        RAISE NOTICE 'Invitation found - Email: %, Name: %, Level: %', 
            invitation_record.email, invitation_record.name, invitation_record.admin_level;
    ELSE
        RAISE NOTICE 'No valid invitation found with token: %', invitation_token;
        RETURN;
    END IF;
    
    -- Try to call the function
    BEGIN
        SELECT create_admin_from_invitation(
            p_user_id => test_user_id,
            p_invite_token => invitation_token
        ) INTO admin_creation_result;
        
        RAISE NOTICE 'Function result: %', admin_creation_result;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Function call failed with error: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
    END;
END $$;

-- Step 4: Check if the dsvi_admins table has the right structure
SELECT 'dsvi_admins table structure:' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Check constraints on dsvi_admins table
SELECT 'dsvi_admins constraints:' as step;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'dsvi_admins'
AND table_schema = 'public';
