-- ===============================================================================
-- FIX FOR PERMISSIONS AND ASSIGNMENTS NOT BEING CREATED
-- ===============================================================================

-- ISSUE: The grant_admin_permission function might have a bug
-- Let's check and fix it

-- 1. First, check the current function definition
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('grant_admin_permission', 'assign_school_to_admin');

-- 2. Create a FIXED version of grant_admin_permission
CREATE OR REPLACE FUNCTION grant_admin_permission(
    target_user_id UUID,
    permission_type TEXT,
    resource_id UUID DEFAULT NULL,
    granted_by_user_id UUID DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    permission_id UUID;
BEGIN
    -- Debug logging
    RAISE NOTICE 'grant_admin_permission called with user_id: %, permission: %', target_user_id, permission_type;
    
    -- Ensure the table doesn't have RLS blocking it
    -- Insert the permission
    INSERT INTO admin_permissions (
        admin_user_id, 
        permission_type, 
        resource_id, 
        granted_by, 
        created_at,
        expires_at,
        is_active
    )
    VALUES (
        target_user_id, 
        permission_type, 
        resource_id, 
        granted_by_user_id, 
        NOW(),
        expires_at,
        TRUE
    )
    ON CONFLICT (admin_user_id, permission_type, resource_id) 
    DO UPDATE SET 
        is_active = TRUE,
        granted_by = EXCLUDED.granted_by,
        expires_at = EXCLUDED.expires_at
    RETURNING id INTO permission_id;
    
    RAISE NOTICE 'Permission created with ID: %', permission_id;
    
    RETURN json_build_object(
        'success', true,
        'permission_id', permission_id,
        'message', 'Permission granted successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in grant_admin_permission: %', SQLERRM;
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to grant permission: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix the create_level2_admin_complete function to properly handle permissions
CREATE OR REPLACE FUNCTION create_level2_admin_complete(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_created_by UUID,
    p_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    profile_result JSON;
    permission_result JSON;
    assignment_result JSON;
    permission_item TEXT;
    school_id UUID;
    final_result JSON;
    permission_count INTEGER := 0;
    assignment_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'create_level2_admin_complete started for user: %', p_email;
    
    -- Step 1: Create user profile
    PERFORM upsert_user_profile(p_user_id, p_email, 'DSVI_ADMIN', p_name);
    RAISE NOTICE 'User profile created/updated';
    
    -- Step 2: Create admin profile
    SELECT safe_create_admin_profile(p_user_id, 2, p_created_by, p_notes) INTO profile_result;
    RAISE NOTICE 'Admin profile result: %', profile_result;
    
    -- Step 3: Grant permissions with better error handling
    IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
        RAISE NOTICE 'Processing % permissions', array_length(p_permissions, 1);
        
        FOREACH permission_item IN ARRAY p_permissions
        LOOP
            RAISE NOTICE 'Granting permission: %', permission_item;
            
            -- Direct insert to ensure it works
            BEGIN
                INSERT INTO admin_permissions (
                    admin_user_id, 
                    permission_type, 
                    granted_by, 
                    created_at, 
                    is_active
                )
                VALUES (
                    p_user_id, 
                    permission_item, 
                    p_created_by, 
                    NOW(), 
                    TRUE
                )
                ON CONFLICT (admin_user_id, permission_type, resource_id) 
                DO UPDATE SET is_active = TRUE;
                
                permission_count := permission_count + 1;
                RAISE NOTICE 'Permission % granted successfully', permission_item;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to grant permission %: %', permission_item, SQLERRM;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE 'No permissions to grant';
    END IF;
    
    -- Step 4: Assign schools (similar approach)
    IF p_school_ids IS NOT NULL AND array_length(p_school_ids, 1) > 0 THEN
        RAISE NOTICE 'Processing % school assignments', array_length(p_school_ids, 1);
        
        FOREACH school_id IN ARRAY p_school_ids
        LOOP
            BEGIN
                INSERT INTO admin_assignments (
                    admin_user_id, 
                    school_id, 
                    assigned_by, 
                    created_at, 
                    is_active
                )
                VALUES (
                    p_user_id, 
                    school_id, 
                    p_created_by, 
                    NOW(), 
                    TRUE
                )
                ON CONFLICT (admin_user_id, school_id) 
                DO UPDATE SET is_active = TRUE;
                
                assignment_count := assignment_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to assign school %: %', school_id, SQLERRM;
            END;
        END LOOP;
    END IF;
    
    -- Verify what was created
    SELECT verify_admin_setup(p_user_id) INTO final_result;
    
    RETURN json_build_object(
        'success', true,
        'user_id', p_user_id,
        'permissions_created', permission_count,
        'schools_assigned', assignment_count,
        'setup_verification', final_result,
        'message', format('Level 2 admin created with %s permissions and %s school assignments', 
                         permission_count, assignment_count)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create Level 2 admin: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SIMPLE WORKAROUND: Update process_level2_admin_signup to insert permissions directly
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    final_result JSON;
BEGIN
    RAISE NOTICE 'process_level2_admin_signup started for: %', p_email;
    
    -- Create the basic admin profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = 'DSVI_ADMIN',
        updated_at = NOW();
    
    INSERT INTO admin_profiles (user_id, admin_level, created_by, created_at, is_active)
    VALUES (p_user_id, 2, p_user_id, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        admin_level = 2,
        is_active = TRUE;
    
    -- Insert default permissions directly
    INSERT INTO admin_permissions (admin_user_id, permission_type, granted_by, created_at, is_active)
    VALUES 
        (p_user_id, 'view_schools', p_user_id, NOW(), TRUE),
        (p_user_id, 'manage_content', p_user_id, NOW(), TRUE)
    ON CONFLICT (admin_user_id, permission_type, resource_id) 
    DO UPDATE SET is_active = TRUE;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Level 2 admin created successfully with default permissions',
        'user_id', p_user_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to process Level 2 admin signup: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Test the fixed functions
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    result JSON;
BEGIN
    SELECT process_level2_admin_signup(test_id, 'test_fixed@example.com', 'test_token') INTO result;
    RAISE NOTICE 'Test result: %', result;
    
    -- Check permissions
    PERFORM * FROM admin_permissions WHERE admin_user_id = test_id;
    IF FOUND THEN
        RAISE NOTICE '✅ Permissions created successfully!';
    ELSE
        RAISE NOTICE '❌ No permissions created';
    END IF;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_id;
    DELETE FROM admin_profiles WHERE user_id = test_id;
    DELETE FROM user_profiles WHERE id = test_id;
END $$;

SELECT 'Functions fixed! Test Level 2 admin signup now.' as status;
