-- ===============================================================================
-- CHECK IF DEPENDENT FUNCTIONS EXIST
-- The process_level2_admin_signup calls create_level2_admin_complete
-- ===============================================================================

-- STEP 6: Check all Level 2 admin related functions
SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'create_level2_admin_complete' THEN 'CRITICAL - Called by process_level2_admin_signup'
        WHEN proname = 'safe_create_admin_profile' THEN 'Important - Creates admin profile'
        WHEN proname = 'grant_admin_permission' THEN 'Important - Grants permissions'
        WHEN proname = 'assign_school_to_admin' THEN 'Important - Assigns schools'
        WHEN proname = 'verify_admin_setup' THEN 'Important - Verifies setup'
        WHEN proname = 'upsert_user_profile' THEN 'CRITICAL - Creates user profile'
        ELSE 'Supporting function'
    END as importance,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
    'create_level2_admin_complete',
    'safe_create_admin_profile',
    'create_admin_profile',
    'grant_admin_permission', 
    'assign_school_to_admin',
    'verify_admin_setup',
    'upsert_user_profile'
)
ORDER BY 
    CASE proname
        WHEN 'create_level2_admin_complete' THEN 1
        WHEN 'upsert_user_profile' THEN 2
        ELSE 3
    END;

-- STEP 7: Check if there are any errors in the function definitions
-- This will show us the actual function bodies
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'process_level2_admin_signup';

-- STEP 8: Test upsert_user_profile directly
-- This is often where the issue lies
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Try to create a user profile directly
    PERFORM upsert_user_profile(
        test_user_id,
        'test_direct@example.com',
        'DSVI_ADMIN',
        'Test Direct User'
    );
    
    -- Check if it was created
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'SUCCESS: upsert_user_profile is working';
    ELSE
        RAISE NOTICE 'FAILURE: upsert_user_profile is NOT creating records';
    END IF;
    
    -- Clean up
    DELETE FROM user_profiles WHERE id = test_user_id;
END $$;
