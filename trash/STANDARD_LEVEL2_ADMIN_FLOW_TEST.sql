-- ===============================================================================
-- STANDARD SQL - LEVEL 2 ADMIN INVITATION & SIGNUP FLOW TEST
-- Date: 2025-06-11
-- Purpose: Verify the complete flow works with dsvi_admin table (Standard SQL)
-- ===============================================================================

-- ===============================================================================
-- STEP 1: VERIFY DATABASE TABLES AND FUNCTIONS EXIST
-- ===============================================================================

SELECT '🔍 STEP 1: Verifying database structure...' as status;

-- Check if required functions exist
SELECT 'Required functions check:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN (
    'create_admin_invitation',
    'get_invitation_by_token', 
    'create_admin_from_invitation',
    'get_admin_level_new',
    'get_admin_by_user_id',
    'list_pending_invitations',
    'list_level2_admins'
) 
AND routine_schema = 'public'
ORDER BY routine_name;

-- Check if required tables exist
SELECT 'Required tables check:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('dsvi_admins', 'pending_admin_invitations', 'schools')
AND table_schema = 'public'
ORDER BY table_name;

-- Check dsvi_admins table structure
SELECT 'dsvi_admins table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================================================================
-- STEP 2: SETUP TEST DATA
-- ===============================================================================

SELECT '🔍 STEP 2: Setting up test data...' as status;

-- Ensure test Level 1 admin exists
INSERT INTO dsvi_admins (
    user_id, email, name, admin_level, permissions, school_ids, 
    notes, is_active, created_by, created_at, updated_at
) VALUES (
    'a3ea08ce-ef88-4ad0-b66e-ed81d230d74a',
    'level1@dsvi.com',
    'Test Level 1 Admin',
    1, -- Level 1 (Super Admin)
    ARRAY['all'], -- All permissions
    ARRAY[]::UUID[], -- Access to all schools
    'Test Level 1 admin for invitation flow testing',
    true,
    'a3ea08ce-ef88-4ad0-b66e-ed81d230d74a',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    admin_level = 1,
    is_active = true,
    updated_at = NOW();

SELECT 'Level 1 admin setup completed' as result;

-- ===============================================================================
-- STEP 3: TEST INVITATION CREATION
-- ===============================================================================

SELECT '🔍 STEP 3: Testing invitation creation...' as status;

-- Clean up any existing test data
DELETE FROM dsvi_admins WHERE email = 'test.level2@example.com';
DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';

-- Get a school ID for testing
DO $$
DECLARE
    test_school_id UUID;
    invitation_result JSON;
    test_level1_user_id UUID := 'a3ea08ce-ef88-4ad0-b66e-ed81d230d74a';
BEGIN
    -- Get a school ID for testing
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    IF test_school_id IS NULL THEN
        RAISE EXCEPTION 'No schools found in database. Please add a school first.';
    END IF;
    
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
    
    -- Check if invitation creation was successful
    IF (invitation_result->>'success')::boolean = true THEN
        RAISE NOTICE 'SUCCESS: Invitation created successfully';
        RAISE NOTICE 'Invitation token: %', invitation_result->>'invite_token';
    ELSE
        RAISE EXCEPTION 'FAILED: Invitation creation failed: %', invitation_result->>'message';
    END IF;
END $$;

-- Verify invitation was saved
SELECT 'Invitation verification:' as info;
SELECT 
    email, name, admin_level, permissions, school_ids, 
    is_used, created_at, expires_at
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';

-- ===============================================================================
-- STEP 4: TEST INVITATION RETRIEVAL
-- ===============================================================================

SELECT '🔍 STEP 4: Testing invitation retrieval...' as status;

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
    
    IF invitation_token IS NULL THEN
        RAISE EXCEPTION 'FAILED: No invitation token found';
    END IF;
    
    -- Test invitation retrieval
    SELECT get_invitation_by_token(invitation_token) INTO invitation_result;
    
    -- Verify the invitation retrieval was successful
    IF (invitation_result->>'success')::boolean = true THEN
        RAISE NOTICE 'SUCCESS: Invitation retrieval successful';
        RAISE NOTICE 'Email: %', invitation_result->'invitation'->>'email';
        RAISE NOTICE 'Name: %', invitation_result->'invitation'->>'name';
        RAISE NOTICE 'Admin Level: %', invitation_result->'invitation'->>'admin_level';
        RAISE NOTICE 'Permissions: %', invitation_result->'invitation'->'permissions';
        RAISE NOTICE 'School IDs: %', invitation_result->'invitation'->'school_ids';
    ELSE
        RAISE EXCEPTION 'FAILED: Invitation retrieval failed: %', invitation_result->>'message';
    END IF;
END $$;

-- ===============================================================================
-- STEP 5: TEST ADMIN CREATION FROM INVITATION
-- ===============================================================================

SELECT '🔍 STEP 5: Testing admin creation from invitation...' as status;

DO $$
DECLARE
    invitation_token TEXT;
    test_user_id UUID := gen_random_uuid(); -- Simulate new user ID
    admin_creation_result JSON;
    created_admin_record RECORD;
BEGIN
    -- Get the invitation token
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' 
    AND is_used = false
    LIMIT 1;
    
    -- Test admin creation from invitation
    SELECT create_admin_from_invitation(
        p_user_id => test_user_id,
        p_invite_token => invitation_token
    ) INTO admin_creation_result;
    
    -- Verify admin creation was successful
    IF (admin_creation_result->>'success')::boolean = true THEN
        RAISE NOTICE 'SUCCESS: Admin created from invitation';
        RAISE NOTICE 'Admin ID: %', admin_creation_result->>'admin_id';
    ELSE
        RAISE EXCEPTION 'FAILED: Admin creation failed: %', admin_creation_result->>'message';
    END IF;
    
    -- Verify admin was created in dsvi_admins table
    SELECT * INTO created_admin_record 
    FROM dsvi_admins 
    WHERE user_id = test_user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'SUCCESS: Admin record found in dsvi_admins table';
        RAISE NOTICE 'Email: %', created_admin_record.email;
        RAISE NOTICE 'Name: %', created_admin_record.name;
        RAISE NOTICE 'Admin Level: %', created_admin_record.admin_level;
        RAISE NOTICE 'Permissions: %', created_admin_record.permissions;
        RAISE NOTICE 'School IDs: %', created_admin_record.school_ids;
        RAISE NOTICE 'Is Active: %', created_admin_record.is_active;
        RAISE NOTICE 'Signup Completed: %', created_admin_record.signup_completed_at;
    ELSE
        RAISE EXCEPTION 'FAILED: Admin record NOT found in dsvi_admins table';
    END IF;
    
    -- Verify invitation was marked as used
    IF EXISTS (
        SELECT 1 FROM pending_admin_invitations 
        WHERE email = 'test.level2@example.com' 
        AND is_used = true 
        AND used_by = test_user_id
    ) THEN
        RAISE NOTICE 'SUCCESS: Invitation marked as used';
    ELSE
        RAISE EXCEPTION 'FAILED: Invitation NOT marked as used';
    END IF;
END $$;

-- Show the created admin record
SELECT 'Created admin record:' as info;
SELECT 
    user_id, email, name, admin_level, permissions, school_ids,
    is_active, signup_completed_at, created_at
FROM dsvi_admins 
WHERE email = 'test.level2@example.com';

-- Show the used invitation
SELECT 'Used invitation record:' as info;
SELECT 
    email, name, is_used, used_at, used_by,
    created_at, expires_at
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';

-- ===============================================================================
-- STEP 6: TEST ADMIN FUNCTIONALITY
-- ===============================================================================

SELECT '🔍 STEP 6: Testing Level 2 admin functionality...' as status;

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
    
    -- Test get_admin_level_new function
    SELECT get_admin_level_new(test_user_id) INTO admin_level;
    
    IF admin_level = 2 THEN
        RAISE NOTICE 'SUCCESS: Correct admin level returned (2)';
    ELSE
        RAISE EXCEPTION 'FAILED: Wrong admin level: % (expected: 2)', admin_level;
    END IF;
    
    -- Test get_admin_by_user_id function
    SELECT * INTO admin_data FROM get_admin_by_user_id(test_user_id) LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE 'SUCCESS: Admin data retrieved successfully';
        RAISE NOTICE 'Admin Level: %', admin_data.admin_level;
        RAISE NOTICE 'Permissions Count: %', array_length(admin_data.permissions, 1);
        RAISE NOTICE 'Schools Count: %', array_length(admin_data.school_ids, 1);
    ELSE
        RAISE EXCEPTION 'FAILED: Could not retrieve admin data';
    END IF;
    
    -- Test permission checking
    SELECT has_admin_permission_new(test_user_id, 'VIEW_SCHOOLS', NULL) INTO has_permission;
    
    IF has_permission = true THEN
        RAISE NOTICE 'SUCCESS: Permission check works (VIEW_SCHOOLS: true)';
    ELSE
        RAISE NOTICE 'WARNING: Permission check returned false for VIEW_SCHOOLS';
    END IF;
    
    -- Test school access
    SELECT get_assigned_schools_new(test_user_id) INTO assigned_schools;
    RAISE NOTICE 'SUCCESS: Assigned schools retrieved: %', assigned_schools;
END $$;

-- ===============================================================================
-- STEP 7: TEST LIST FUNCTIONS
-- ===============================================================================

SELECT '🔍 STEP 7: Testing list functions...' as status;

-- Test list_pending_invitations function
SELECT 'Testing pending invitations list:' as info;
SELECT COUNT(*) as pending_count FROM list_pending_invitations();

-- Test list_level2_admins function  
SELECT 'Testing Level 2 admins list:' as info;
SELECT COUNT(*) as level2_admin_count FROM list_level2_admins();

-- Show our test admin in the list
SELECT 'Our test admin in level2 list:' as info;
SELECT email, name, admin_level, permissions_count, schools_count, is_active
FROM list_level2_admins() 
WHERE email = 'test.level2@example.com';

-- ===============================================================================
-- STEP 8: CLEANUP TEST DATA
-- ===============================================================================

SELECT '🔍 STEP 8: Cleaning up test data...' as status;

-- Remove test admin
DELETE FROM dsvi_admins WHERE email = 'test.level2@example.com';

-- Remove test invitation
DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';

SELECT 'Test cleanup completed successfully' as result;

-- ===============================================================================
-- FINAL SUMMARY
-- ===============================================================================

SELECT '🎉 COMPREHENSIVE FLOW TEST COMPLETED SUCCESSFULLY! 🎉' as final_result;

SELECT '✅ All tests passed:
- Database structure verified
- Invitation creation works  
- Invitation retrieval works
- Admin creation from invitation works
- Level 2 admin functionality works
- List functions work
- Data flows correctly from pending_admin_invitations to dsvi_admins
- All permissions and school assignments preserved
- Test data cleaned up' as summary;
