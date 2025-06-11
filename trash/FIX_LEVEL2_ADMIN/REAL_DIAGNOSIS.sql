-- ===============================================================================
-- REAL DIAGNOSIS: WHY LEVEL 2 ADMIN SIGNUP IS FAILING
-- Run each section to identify the exact problem
-- ===============================================================================

-- SECTION 1: Test the signup function with a real example
-- First, let's create a test user and see what happens
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_result JSON;
BEGIN
    -- Simulate what happens during signup
    RAISE NOTICE 'Testing Level 2 admin signup process...';
    
    -- Call the function
    SELECT process_level2_admin_signup(
        test_user_id,
        'test_l2_admin@example.com',
        'test_invite_token_123'
    ) INTO test_result;
    
    RAISE NOTICE 'Function result: %', test_result;
    
    -- Check if records were created
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✓ user_profiles record created';
    ELSE
        RAISE NOTICE '✗ user_profiles record NOT created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✓ admin_profiles record created';
    ELSE
        RAISE NOTICE '✗ admin_profiles record NOT created';
    END IF;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
    DELETE FROM user_profiles WHERE id = test_user_id;
END $$;

-- SECTION 2: Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'admin_profiles', 'admin_permissions', 'admin_assignments')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- SECTION 3: Check if tables have RLS enabled (this could block inserts)
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED - Could block inserts!'
        ELSE 'RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('user_profiles', 'admin_profiles', 'admin_permissions', 'admin_assignments', 'admin_school_assignments')
AND schemaname = 'public';

-- SECTION 4: Check RLS policies on these tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'admin_profiles', 'admin_permissions', 'admin_assignments')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- SECTION 5: Test each function individually
-- Test upsert_user_profile
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing upsert_user_profile...';
    
    PERFORM upsert_user_profile(
        test_user_id,
        'test_upsert@example.com',
        'DSVI_ADMIN',
        'Test Upsert User'
    );
    
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✓ upsert_user_profile WORKS';
        DELETE FROM user_profiles WHERE id = test_user_id;
    ELSE
        RAISE NOTICE '✗ upsert_user_profile FAILED - This is likely the issue!';
    END IF;
END $$;

-- Test safe_create_admin_profile
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    result JSON;
BEGIN
    RAISE NOTICE 'Testing safe_create_admin_profile...';
    
    SELECT safe_create_admin_profile(
        test_user_id,
        2,
        test_user_id,
        'Test admin profile'
    ) INTO result;
    
    RAISE NOTICE 'Result: %', result;
    
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✓ safe_create_admin_profile WORKS';
        DELETE FROM admin_profiles WHERE user_id = test_user_id;
    ELSE
        RAISE NOTICE '✗ safe_create_admin_profile FAILED';
    END IF;
END $$;
