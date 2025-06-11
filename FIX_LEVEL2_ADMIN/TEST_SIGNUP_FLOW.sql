-- ===============================================================================
-- TEST CURRENT SIGNUP FLOW
-- This simulates exactly what happens when AuthContext calls the function
-- ===============================================================================

-- First, check if you have any existing DSVI_ADMIN users without profiles
SELECT 
    'Existing DSVI Admins Without Profiles' as check_type,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'inviteToken' as invite_token,
    up.id as user_profile_id,
    ap.id as admin_profile_id,
    ap.admin_level
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
  AND (up.id IS NULL OR ap.id IS NULL)
ORDER BY u.created_at DESC;

-- Now let's trace through the exact function call
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    signup_result JSON;
    step_result JSON;
BEGIN
    RAISE NOTICE '=== Starting Level 2 Admin Signup Test ===';
    
    -- Step 1: Call process_level2_admin_signup (what AuthContext does)
    RAISE NOTICE 'Step 1: Calling process_level2_admin_signup...';
    SELECT process_level2_admin_signup(
        test_user_id,
        'test_trace@example.com',
        'test_token_trace'
    ) INTO signup_result;
    
    RAISE NOTICE 'Signup result: %', signup_result;
    
    -- Step 2: Check what was created
    RAISE NOTICE 'Step 2: Checking created records...';
    
    -- Check user_profiles
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✓ user_profiles: Record created successfully';
    ELSE
        RAISE NOTICE '✗ user_profiles: NO RECORD CREATED - Check upsert_user_profile function';
    END IF;
    
    -- Check admin_profiles  
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✓ admin_profiles: Record created successfully';
    ELSE
        RAISE NOTICE '✗ admin_profiles: NO RECORD CREATED - Check safe_create_admin_profile function';
    END IF;
    
    -- Step 3: Try direct table inserts to see if it's a permission issue
    RAISE NOTICE 'Step 3: Testing direct inserts...';
    
    BEGIN
        INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'direct_test@example.com', 'DSVI_ADMIN', 'Direct Test', NOW(), NOW());
        RAISE NOTICE '✓ Direct insert to user_profiles: SUCCESS';
        DELETE FROM user_profiles WHERE email = 'direct_test@example.com';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Direct insert to user_profiles: FAILED - %', SQLERRM;
    END;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
    DELETE FROM user_profiles WHERE id = test_user_id;
    
    RAISE NOTICE '=== Test Complete ===';
END $$;
