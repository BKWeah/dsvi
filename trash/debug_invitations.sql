-- Debug: Check what invitations actually exist

-- Step 1: See all pending invitations
SELECT 'All pending invitations:' as info;
SELECT 
    email, name, invite_token, is_used, 
    expires_at, expires_at > NOW() as not_expired,
    created_at
FROM pending_admin_invitations 
ORDER BY created_at DESC;

-- Step 2: Specifically check for our test invitation
SELECT 'Our test invitation details:' as info;
SELECT 
    email, name, invite_token, is_used,
    expires_at, expires_at > NOW() as not_expired,
    created_at, expires_at - NOW() as time_until_expiry
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com'
ORDER BY created_at DESC;

-- Step 3: Check if invitation creation is working at all
SELECT 'Testing invitation creation:' as info;

-- Clean up first
DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';

-- Try to create a new invitation
DO $$
DECLARE
    real_user_id UUID;
    test_school_id UUID;
    invitation_result JSON;
BEGIN
    -- Get a real user ID from auth.users
    SELECT id INTO real_user_id FROM auth.users LIMIT 1;
    
    IF real_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table - you need to have at least one user';
    END IF;
    
    -- Get a school ID
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    IF test_school_id IS NULL THEN
        RAISE EXCEPTION 'No schools found - you need to have at least one school';
    END IF;
    
    RAISE NOTICE 'Using user ID: %', real_user_id;
    RAISE NOTICE 'Using school ID: %', test_school_id;
    
    -- Create invitation
    SELECT create_admin_invitation(
        p_email => 'test.level2@example.com',
        p_name => 'Test Level 2 Admin',
        p_created_by => real_user_id,
        p_permissions => ARRAY['VIEW_SCHOOLS', 'MANAGE_CONTENT'],
        p_school_ids => ARRAY[test_school_id],
        p_notes => 'Test invitation for debugging',
        p_days_valid => 7
    ) INTO invitation_result;
    
    RAISE NOTICE 'Invitation creation result: %', invitation_result;
    
    IF (invitation_result->>'success')::boolean = true THEN
        RAISE NOTICE 'SUCCESS: Invitation created';
    ELSE
        RAISE NOTICE 'FAILED: Invitation creation failed: %', invitation_result->>'message';
    END IF;
END $$;

-- Step 4: Check what was actually created
SELECT 'After creation attempt:' as info;
SELECT 
    email, name, invite_token, is_used,
    expires_at, expires_at > NOW() as not_expired,
    admin_level, permissions, school_ids,
    created_at
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';
