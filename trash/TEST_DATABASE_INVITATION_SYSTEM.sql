-- TEST THE NEW DATABASE INVITATION SYSTEM
-- Run this to test the complete database-based invitation flow

-- 1. Test creating an invitation
SELECT 'TESTING DATABASE INVITATION CREATION:' as test_phase;

DO $$
DECLARE
    creator_user_id UUID;
    invitation_result JSON;
    invitation_token TEXT;
    test_email TEXT := 'testuser@example.com';
BEGIN
    -- Get a real user ID to use as creator
    SELECT id INTO creator_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    
    IF creator_user_id IS NULL THEN
        RAISE NOTICE '❌ No users found in auth.users table. Cannot test invitation creation.';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Using creator user ID: %', creator_user_id;
    
    -- Create test invitation
    SELECT create_admin_invitation(
        test_email,
        'Test User',
        creator_user_id,
        ARRAY['manage_schools', 'view_reports']::TEXT[],
        ARRAY[]::UUID[],
        'Test invitation from database system',
        7
    ) INTO invitation_result;
    
    RAISE NOTICE '📧 Invitation creation result: %', invitation_result;
    
    IF (invitation_result->>'success')::BOOLEAN THEN
        invitation_token := invitation_result->>'invite_token';
        RAISE NOTICE '✅ Invitation created successfully!';
        RAISE NOTICE '🎫 Invite token: %', invitation_token;
        RAISE NOTICE '🔗 Signup link: %', invitation_result->>'signup_link';
        
        -- Test retrieving the invitation
        DECLARE
            get_result JSON;
        BEGIN
            SELECT get_invitation_by_token(invitation_token) INTO get_result;
            RAISE NOTICE '🔍 Invitation retrieval result: %', get_result;
            
            IF (get_result->>'success')::BOOLEAN THEN
                RAISE NOTICE '✅ Invitation successfully retrieved from database';
            ELSE
                RAISE NOTICE '❌ Failed to retrieve invitation: %', get_result->>'message';
            END IF;
        END;
        
        -- Clean up test invitation
        DELETE FROM pending_admin_invitations WHERE invite_token = invitation_token;
        RAISE NOTICE '🧹 Test invitation cleaned up';
        
    ELSE
        RAISE NOTICE '❌ Invitation creation failed: %', invitation_result->>'message';
    END IF;
END $$;

-- 2. Show current invitations table structure
SELECT 'CURRENT INVITATIONS TABLE:' as info;
SELECT 
    count(*) as total_invitations,
    count(*) FILTER (WHERE is_used = false AND expires_at > NOW()) as active_invitations,
    count(*) FILTER (WHERE is_used = true) as used_invitations,
    count(*) FILTER (WHERE expires_at <= NOW()) as expired_invitations
FROM pending_admin_invitations;

-- 3. List any existing active invitations
SELECT 'ACTIVE INVITATIONS:' as info;
SELECT 
    email,
    name,
    invite_token,
    created_at,
    expires_at,
    EXTRACT(DAY FROM (expires_at - NOW()))::INTEGER as days_until_expiry
FROM pending_admin_invitations 
WHERE is_used = false AND expires_at > NOW()
ORDER BY created_at DESC;

SELECT '🎉 Database invitation system test completed!' as final_status;
SELECT 'Next: Update frontend code to use database functions instead of localStorage' as next_step;
