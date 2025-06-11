-- ===============================================================================
-- DIAGNOSE WHY ASSIGNMENTS AND PERMISSIONS AREN'T CREATED
-- ===============================================================================

-- STEP 1: Check what the current process_level2_admin_signup function is doing
SELECT prosrc FROM pg_proc WHERE proname = 'process_level2_admin_signup';

-- STEP 2: Test the permission and assignment functions directly
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    permission_result JSON;
    assignment_result JSON;
BEGIN
    RAISE NOTICE '=== Testing Permission and Assignment Functions ===';
    
    -- First create a basic admin profile (this works as you confirmed)
    INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
    VALUES (test_user_id, 2, NOW(), true);
    
    -- Test grant_admin_permission
    RAISE NOTICE 'Testing grant_admin_permission...';
    BEGIN
        SELECT grant_admin_permission(
            test_user_id,
            'view_schools',
            NULL,
            test_user_id
        ) INTO permission_result;
        
        RAISE NOTICE 'Permission result: %', permission_result;
        
        IF EXISTS (SELECT 1 FROM admin_permissions WHERE admin_user_id = test_user_id) THEN
            RAISE NOTICE '✅ grant_admin_permission WORKS';
        ELSE
            RAISE NOTICE '❌ grant_admin_permission FAILED';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ grant_admin_permission ERROR: %', SQLERRM;
    END;
    
    -- Test direct insert into admin_permissions
    RAISE NOTICE 'Testing direct insert into admin_permissions...';
    BEGIN
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES (test_user_id, 'test_permission', NOW(), true);
        RAISE NOTICE '✅ Direct insert to admin_permissions WORKS';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Direct insert to admin_permissions FAILED: %', SQLERRM;
    END;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
END $$;

-- STEP 3: Check table constraints that might be blocking inserts
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('admin_permissions', 'admin_assignments', 'admin_school_assignments')
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;
-- ===============================================================================
-- CHECK THE ACTUAL FLOW IN create_level2_admin_complete
-- ===============================================================================

-- STEP 4: Look at what create_level2_admin_complete is actually doing
-- The function should be creating permissions but it might be failing silently
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_result JSON;
BEGIN
    RAISE NOTICE '=== Testing create_level2_admin_complete with permissions ===';
    
    -- Call the function exactly as process_level2_admin_signup does
    SELECT create_level2_admin_complete(
        test_user_id,
        'test_complete@example.com',
        'Test Complete Admin',
        test_user_id,
        ARRAY['view_schools', 'manage_content']::TEXT[], -- Same permissions as in the function
        ARRAY[]::UUID[], -- Empty schools array like in the function
        'Testing complete creation'
    ) INTO test_result;
    
    RAISE NOTICE 'Function result: %', test_result;
    
    -- Check what was created
    RAISE NOTICE '--- Checking created records ---';
    
    -- Check user_profiles
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ user_profiles: Created';
    ELSE
        RAISE NOTICE '❌ user_profiles: NOT created';
    END IF;
    
    -- Check admin_profiles
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✅ admin_profiles: Created';
    ELSE
        RAISE NOTICE '❌ admin_profiles: NOT created';
    END IF;
    
    -- Check admin_permissions
    SELECT COUNT(*) FROM admin_permissions WHERE admin_user_id = test_user_id
    INTO test_result;
    RAISE NOTICE 'admin_permissions count: %', test_result;
    
    -- Show the actual permissions if any
    FOR test_result IN 
        SELECT permission_type, is_active, created_at 
        FROM admin_permissions 
        WHERE admin_user_id = test_user_id
    LOOP
        RAISE NOTICE 'Permission found: %', test_result;
    END LOOP;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
    DELETE FROM user_profiles WHERE id = test_user_id;
END $$;

-- STEP 5: Check if the issue is with the array handling
-- Sometimes PostgreSQL has issues with array parameters
DO $$
DECLARE
    test_permissions TEXT[] := ARRAY['view_schools', 'manage_content']::TEXT[];
    perm TEXT;
BEGIN
    RAISE NOTICE 'Testing array handling...';
    RAISE NOTICE 'Array length: %', array_length(test_permissions, 1);
    
    FOREACH perm IN ARRAY test_permissions
    LOOP
        RAISE NOTICE 'Permission in array: %', perm;
    END LOOP;
END $$;
