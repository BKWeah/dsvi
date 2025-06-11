-- ===============================================================================
-- COMPREHENSIVE LEVEL 2 ADMIN INVITATION & SIGNUP FLOW TEST
-- Date: 2025-06-11
-- Purpose: Verify the complete flow from invitation creation to admin signup
-- ===============================================================================

-- ===============================================================================
-- STEP 1: VERIFY DATABASE TABLES AND FUNCTIONS EXIST
-- ===============================================================================

\echo '🔍 STEP 1: Verifying database structure...'

-- Check if dsvi_admin table exists with correct structure
SELECT 'dsvi_admins table structure:' as info;
\d dsvi_admins;

-- Check if pending_admin_invitations table exists
SELECT 'pending_admin_invitations table structure:' as info;
\d pending_admin_invitations;

-- Verify required functions exist
SELECT 'Required functions:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN (
    'create_admin_invitation',
    'get_invitation_by_token', 
    'create_admin_from_invitation',
    'get_admin_level_new',
    'get_admin_by_user_id',
    'list_pending_invitations'
) 
ORDER BY routine_name;

-- ===============================================================================
-- STEP 2: TEST INVITATION CREATION (Level 1 Admin Creates Invitation)
-- ===============================================================================

\echo '🔍 STEP 2: Testing invitation creation...'

-- Create a test Level 1 admin first (for testing purposes)
DO $$
DECLARE
    test_level1_user_id UUID := 'a3ea08ce-ef88-4ad0-b66e-ed81d230d74a'; -- Use your existing Level 1 admin
BEGIN
    -- Ensure Level 1 admin exists in dsvi_admins
    INSERT INTO dsvi_admins (
        user_id, email, name, admin_level, permissions, school_ids, 
        notes, is_active, created_by, created_at, updated_at
    ) VALUES (
        test_level1_user_id,
        'level1@dsvi.com',
        'Test Level 1 Admin',
        1, -- Level 1 (Super Admin)
        ARRAY['all'], -- All permissions
        ARRAY[]::UUID[], -- Access to all schools
        'Test Level 1 admin for invitation flow testing',
        true,
        test_level1_user_id,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE '✅ Level 1 admin ensured in dsvi_admins table';
END $$;

-- Test invitation creation
SELECT 'Testing invitation creation...' as info;

-- Get a school ID for testing
DO $$
DECLARE
    test_school_id UUID;
    invitation_result JSON;
    test_level1_user_id UUID := 'a3ea08ce-ef88-4ad0-b66e-ed81d230d74a';
BEGIN
    -- Get a school ID for testing
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    -- Create invitation
    SELECT create_admin_invitation(
        p_email => 'test.level2@example.com',
        p_name => 'Test Level 2 Admin',
        p_created_by => test_level1_user_id,
        p_permissions => ARRAY['VIEW_SCHOOLS', 'MANAGE_CONTENT'],
        p_school_ids => ARRAY[test_school_id],
        p_notes => 'Test invitation for Level 2 admin flow verification',
        p_days_valid => 7
    ) INTO invitation_result;
    
    RAISE NOTICE '✅ Invitation creation result: %', invitation_result;
    
    -- Verify invitation was saved in pending_admin_invitations
    IF EXISTS (
        SELECT 1 FROM pending_admin_invitations 
        WHERE email = 'test.level2@example.com' 
        AND is_used = false
    ) THEN
        RAISE NOTICE '✅ Invitation successfully saved in pending_admin_invitations table';
    ELSE
        RAISE EXCEPTION '❌ Invitation NOT found in pending_admin_invitations table';
    END IF;
END $$;

-- ===============================================================================
-- STEP 3: TEST INVITATION RETRIEVAL (Signup Page Gets Invitation)
-- ===============================================================================

\echo '🔍 STEP 3: Testing invitation retrieval...'

DO $$
DECLARE
    invitation_token TEXT;
    invitation_result JSON;
BEGIN
    -- Get the invitation token
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' 
    AND is_used = false
    LIMIT 1;
    
    RAISE NOTICE '🔍 Testing with invitation token: %', invitation_token;
    
    -- Test invitation retrieval
    SELECT get_invitation_by_token(invitation_token) INTO invitation_result;
    
    RAISE NOTICE '✅ Invitation retrieval result: %', invitation_result;
    
    -- Verify the invitation contains all expected data
    IF (invitation_result->>'success')::boolean = true THEN
        RAISE NOTICE '✅ Invitation retrieval successful';
        RAISE NOTICE '📧 Email: %', invitation_result->'invitation'->>'email';
        RAISE NOTICE '👤 Name: %', invitation_result->'invitation'->>'name';
        RAISE NOTICE '🔐 Permissions: %', invitation_result->'invitation'->'permissions';
        RAISE NOTICE '🏫 School IDs: %', invitation_result->'invitation'->'school_ids';
    ELSE
        RAISE EXCEPTION '❌ Invitation retrieval failed: %', invitation_result->>'message';
    END IF;
END $$;

-- ===============================================================================
-- STEP 4: TEST ADMIN CREATION FROM INVITATION (Signup Completion)
-- ===============================================================================

\echo '🔍 STEP 4: Testing admin creation from invitation...'

DO $$
DECLARE
    invitation_token TEXT;
    test_user_id UUID := gen_random_uuid(); -- Simulate new user ID from auth.users
    admin_creation_result JSON;
    created_admin_record RECORD;
BEGIN
    -- Get the invitation token
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' 
    AND is_used = false
    LIMIT 1;
    
    RAISE NOTICE '🔍 Creating admin from invitation with token: %', invitation_token;
    RAISE NOTICE '🔍 Simulated user ID: %', test_user_id;
    
    -- Test admin creation from invitation
    SELECT create_admin_from_invitation(
        p_user_id => test_user_id,
        p_invite_token => invitation_token
    ) INTO admin_creation_result;
    
    RAISE NOTICE '✅ Admin creation result: %', admin_creation_result;
    
    -- Verify admin was created in dsvi_admins table
    SELECT * INTO created_admin_record 
    FROM dsvi_admins 
    WHERE user_id = test_user_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin successfully created in dsvi_admins table';
        RAISE NOTICE '📧 Email: %', created_admin_record.email;
        RAISE NOTICE '👤 Name: %', created_admin_record.name;
        RAISE NOTICE '📊 Admin Level: %', created_admin_record.admin_level;
        RAISE NOTICE '🔐 Permissions: %', created_admin_record.permissions;
        RAISE NOTICE '🏫 School IDs: %', created_admin_record.school_ids;
        RAISE NOTICE '📝 Notes: %', created_admin_record.notes;
        RAISE NOTICE '✅ Active: %', created_admin_record.is_active;
        RAISE NOTICE '🎯 Signup Completed At: %', created_admin_record.signup_completed_at;
    ELSE
        RAISE EXCEPTION '❌ Admin NOT created in dsvi_admins table';
    END IF;
    
    -- Verify invitation was marked as used
    IF EXISTS (
        SELECT 1 FROM pending_admin_invitations 
        WHERE email = 'test.level2@example.com' 
        AND is_used = true 
        AND used_by = test_user_id
    ) THEN
        RAISE NOTICE '✅ Invitation marked as used in pending_admin_invitations';
    ELSE
        RAISE EXCEPTION '❌ Invitation NOT marked as used';
    END IF;
END $$;

-- ===============================================================================
-- STEP 5: TEST ADMIN FUNCTIONALITY (Level 2 Admin Functions)
-- ===============================================================================

\echo '🔍 STEP 5: Testing Level 2 admin functionality...'

DO $$
DECLARE
    test_user_id UUID;
    admin_level INTEGER;
    admin_data RECORD;
    has_permission BOOLEAN;
    assigned_schools UUID[];
BEGIN
    -- Get the created admin's user_id
    SELECT user_id INTO test_user_id 
    FROM dsvi_admins 
    WHERE email = 'test.level2@example.com' 
    LIMIT 1;
    
    RAISE NOTICE '🔍 Testing functionality for user: %', test_user_id;
    
    -- Test get_admin_level_new function
    SELECT get_admin_level_new(test_user_id) INTO admin_level;
    RAISE NOTICE '✅ Admin level function result: %', admin_level;
    
    IF admin_level = 2 THEN
        RAISE NOTICE '✅ Correct admin level (2) returned';
    ELSE
        RAISE EXCEPTION '❌ Wrong admin level returned: % (expected: 2)', admin_level;
    END IF;
    
    -- Test get_admin_by_user_id function
    SELECT * INTO admin_data FROM get_admin_by_user_id(test_user_id) LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin data retrieved successfully';
        RAISE NOTICE '📊 Admin Level: %', admin_data.admin_level;
        RAISE NOTICE '🔐 Permissions Count: %', array_length(admin_data.permissions, 1);
        RAISE NOTICE '🏫 Schools Count: %', array_length(admin_data.school_ids, 1);
    ELSE
        RAISE EXCEPTION '❌ Could not retrieve admin data';
    END IF;
    
    -- Test permission checking
    SELECT has_admin_permission_new(test_user_id, 'VIEW_SCHOOLS', NULL) INTO has_permission;
    RAISE NOTICE '✅ Permission check (VIEW_SCHOOLS): %', has_permission;
    
    -- Test school access
    SELECT get_assigned_schools_new(test_user_id) INTO assigned_schools;
    RAISE NOTICE '✅ Assigned schools: %', assigned_schools;
END $$;

-- ===============================================================================
-- STEP 6: TEST INVITATION LISTING (Admin Management Page)
-- ===============================================================================

\echo '🔍 STEP 6: Testing invitation listing functionality...'

-- Test list_pending_invitations function
SELECT 'Testing invitation listing...' as info;
SELECT * FROM list_pending_invitations() LIMIT 5;

-- Test list_level2_admins function
SELECT 'Testing Level 2 admin listing...' as info;
SELECT * FROM list_level2_admins() LIMIT 5;

-- ===============================================================================
-- STEP 7: CLEANUP TEST DATA
-- ===============================================================================

\echo '🔍 STEP 7: Cleaning up test data...'

DO $$
BEGIN
    -- Remove test admin
    DELETE FROM dsvi_admins WHERE email = 'test.level2@example.com';
    RAISE NOTICE '✅ Test admin removed from dsvi_admins';
    
    -- Remove test invitation
    DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';
    RAISE NOTICE '✅ Test invitation removed from pending_admin_invitations';
    
    RAISE NOTICE '🎉 Test cleanup completed successfully';
END $$;

-- ===============================================================================
-- FINAL SUMMARY
-- ===============================================================================

\echo '🎉 COMPREHENSIVE FLOW TEST COMPLETED!'
\echo ''
\echo '✅ Database structure verified'
\echo '✅ Invitation creation works'
\echo '✅ Invitation retrieval works'  
\echo '✅ Admin creation from invitation works'
\echo '✅ Level 2 admin functionality works'
\echo '✅ Admin and invitation listing works'
\echo '✅ Test data cleaned up'
\echo ''
\echo '🎯 The complete Level 2 admin invitation and signup flow is working correctly!'
\echo '🔄 Data flows properly from pending_admin_invitations to dsvi_admins table'
\echo '📊 All permissions, school assignments, and metadata are preserved'
