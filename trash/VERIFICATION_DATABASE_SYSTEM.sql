-- VERIFICATION: Test the Updated Database-Based Invitation System
-- Run this in Supabase SQL Editor to verify everything works

-- 1. Check if the database system was created properly
SELECT 'CHECKING DATABASE SETUP:' as status;

-- Check if pending_admin_invitations table exists
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pending_admin_invitations'
    ) THEN '✅ pending_admin_invitations table EXISTS'
    ELSE '❌ pending_admin_invitations table MISSING'
    END as table_status;

-- Check if all required functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
        ('create_admin_invitation'),
        ('get_invitation_by_token'),
        ('process_level2_admin_signup'),
        ('mark_invitation_used'),
        ('list_pending_invitations'),
        ('create_level2_admin_complete')
) AS required_functions(routine_name)
LEFT JOIN information_schema.routines r ON r.routine_name = required_functions.routine_name
ORDER BY required_functions.routine_name;

-- 2. Test creating an invitation
SELECT 'TESTING INVITATION CREATION:' as test_phase;

DO $$
DECLARE
    creator_user_id UUID;
    invitation_result JSON;
    invitation_token TEXT;
    test_email TEXT := 'test@example.com';
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
        'Test invitation - database system verification',
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

-- 3. Show current state
SELECT 'CURRENT SYSTEM STATE:' as info;
SELECT 
    count(*) as total_invitations,
    count(*) FILTER (WHERE is_used = false AND expires_at > NOW()) as active_invitations,
    count(*) FILTER (WHERE is_used = true) as used_invitations,
    count(*) FILTER (WHERE expires_at <= NOW()) as expired_invitations
FROM pending_admin_invitations;

SELECT '🎉 Database invitation system verification completed!' as final_status;
SELECT 'Next: Test creating a real invitation in the admin interface' as next_step;
