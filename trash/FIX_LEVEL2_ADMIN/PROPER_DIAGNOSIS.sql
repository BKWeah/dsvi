-- ===============================================================================
-- COMPREHENSIVE DIAGNOSIS FOR LEVEL 2 ADMIN SIGNUP ISSUE
-- Run each section step by step to identify the exact problem
-- ===============================================================================

-- STEP 1: Check if create_level2_admin_complete function exists
SELECT 
    'Function Check' as diagnosis_step,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'create_level2_admin_complete';

-- STEP 2: Test the existing process_level2_admin_signup function directly
-- Replace the UUID and email with a test user
DO $$
DECLARE
    test_result JSON;
BEGIN
    -- First, let's see what happens when we call the function
    SELECT process_level2_admin_signup(
        '00000000-0000-0000-0000-000000000000'::UUID,  -- Replace with actual user ID
        'test@example.com',
        'test_token_123'
    ) INTO test_result;
    
    RAISE NOTICE 'Function result: %', test_result;
END $$;

-- STEP 3: Check if user_profiles table exists and has data
SELECT 
    'user_profiles check' as table_check,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE role = 'DSVI_ADMIN') as dsvi_admin_count
FROM user_profiles;

-- STEP 4: Check admin_profiles table
SELECT 
    'admin_profiles check' as table_check,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE admin_level = 2) as level_2_count
FROM admin_profiles;

-- STEP 5: Check recent DSVI_ADMIN users and their profile status
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role,
    up.id as user_profile_exists,
    ap.id as admin_profile_exists,
    ap.admin_level
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
ORDER BY u.created_at DESC
LIMIT 5;
