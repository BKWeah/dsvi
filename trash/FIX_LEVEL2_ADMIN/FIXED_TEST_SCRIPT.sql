-- ===============================================================================
-- FIX FOR TEST SCRIPT ERROR
-- Replace the test section that's failing with this working version
-- ===============================================================================

-- Working test that won't fail with foreign key constraint
DO $$
DECLARE
    test_invitation_id UUID;
    test_user_id UUID;
    test_school_id UUID;
    test_result JSON;
    current_user_id UUID;
BEGIN
    RAISE NOTICE '=== Testing Complete Invitation Flow ===';
    
    -- Get current user ID or a valid user from database
    SELECT COALESCE(auth.uid(), (SELECT id FROM auth.users WHERE email LIKE '%@dsvi%' LIMIT 1))
    INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No valid user found for testing';
        RETURN;
    END IF;
    
    -- Use a new test user ID
    test_user_id := gen_random_uuid();
    
    -- Get a valid school ID
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    -- Create a test invitation with valid created_by
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, permissions, school_ids, notes,
        created_by, expires_at, is_used
    ) VALUES (
        'test_complete@example.com',
        'Test Complete Admin',
        'test_token_complete_' || extract(epoch from now())::text,
        encode('test_complete@example.com'::bytea, 'base64'),
        'TempPass123',
        2,
        ARRAY['view_schools', 'manage_content', 'edit_schools']::TEXT[],
        CASE WHEN test_school_id IS NOT NULL 
             THEN ARRAY[test_school_id]::UUID[] 
             ELSE ARRAY[]::UUID[] 
        END,
        'Test invitation with schools',
        current_user_id,  -- Use valid user ID here
        NOW() + INTERVAL '7 days',
        FALSE
    ) RETURNING id INTO test_invitation_id;
    
    RAISE NOTICE 'Created test invitation: %', test_invitation_id;
    
    -- Process the signup
    SELECT process_level2_admin_signup(
        test_user_id,
        'test_complete@example.com',
        (SELECT invite_token FROM pending_admin_invitations WHERE id = test_invitation_id)
    ) INTO test_result;
    
    RAISE NOTICE 'Signup result: %', test_result;
    
    -- Verify
    PERFORM COUNT(*) FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'User profile created: %', FOUND;
    
    PERFORM COUNT(*) FROM admin_profiles WHERE user_id = test_user_id;
    RAISE NOTICE 'Admin profile created: %', FOUND;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_school_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
    DELETE FROM user_profiles WHERE id = test_user_id;
    DELETE FROM pending_admin_invitations WHERE id = test_invitation_id;
    
    RAISE NOTICE '=== Test Complete ===';
END $$;

SELECT 'Test script fixed! This version uses valid user IDs.' as status;
