-- Quick fix: Update the invitation with a real user ID

-- Step 1: Clean up any existing test data
DELETE FROM dsvi_admins WHERE email = 'test.level2@example.com';
DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';

-- Step 2: Get a real user ID from your auth.users table
DO $$
DECLARE
    real_user_id UUID;
    test_school_id UUID;
    invitation_result JSON;
BEGIN
    -- Get a real user ID (preferably your Level 1 admin)
    SELECT id INTO real_user_id FROM auth.users LIMIT 1;
    
    IF real_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table';
    END IF;
    
    -- Get a school ID
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    IF test_school_id IS NULL THEN
        RAISE EXCEPTION 'No schools found in schools table';
    END IF;
    
    RAISE NOTICE 'Using real user ID: %', real_user_id;
    RAISE NOTICE 'Using school ID: %', test_school_id;
    
    -- Create invitation with real user ID
    SELECT create_admin_invitation(
        p_email => 'test.level2@example.com',
        p_name => 'Test Level 2 Admin',
        p_created_by => real_user_id,  -- Use real user ID
        p_permissions => ARRAY['VIEW_SCHOOLS', 'MANAGE_CONTENT'],
        p_school_ids => ARRAY[test_school_id],
        p_notes => 'Test invitation with real user ID',
        p_days_valid => 7
    ) INTO invitation_result;
    
    RAISE NOTICE 'Invitation result: %', invitation_result;
END $$;

-- Step 3: Now test the admin creation
DO $$
DECLARE
    invitation_token TEXT;
    test_user_id UUID := gen_random_uuid();
    admin_creation_result JSON;
BEGIN
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' 
    AND is_used = false;
    
    SELECT create_admin_from_invitation(
        p_user_id => test_user_id,
        p_invite_token => invitation_token
    ) INTO admin_creation_result;
    
    RAISE NOTICE 'Admin creation result: %', admin_creation_result;
    
    IF (admin_creation_result->>'success')::boolean = true THEN
        RAISE NOTICE 'SUCCESS: Admin created successfully!';
    ELSE
        RAISE NOTICE 'FAILED: %', admin_creation_result->>'message';
    END IF;
END $$;
