-- COMPREHENSIVE DEBUG: Create Level 2 Admin with Full Logging
-- This version includes extensive logging to help debug the issue

CREATE OR REPLACE FUNCTION debug_create_level2_admin_complete(
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
    permission_errors TEXT[] := ARRAY[]::TEXT[];
    assignment_errors TEXT[] := ARRAY[]::TEXT[];
    debug_info JSON;
BEGIN
    -- Log start
    RAISE NOTICE 'DEBUG: Starting Level 2 admin creation for user % with email %', p_user_id, p_email;
    
    -- Check if tables exist
    RAISE NOTICE 'DEBUG: Checking if required tables exist...';
    
    -- Step 1: Create admin profile
    RAISE NOTICE 'DEBUG: Step 1 - Creating admin profile...';
    SELECT safe_create_admin_profile(p_user_id, 2, p_created_by, p_notes) INTO profile_result;
    RAISE NOTICE 'DEBUG: Admin profile result: %', profile_result;
    
    IF NOT (profile_result->>'success')::BOOLEAN THEN
        RAISE NOTICE 'DEBUG: Admin profile creation failed, returning early';
        RETURN profile_result;
    END IF;
    
    -- Step 2: Create user profile entry
    RAISE NOTICE 'DEBUG: Step 2 - Creating user profile...';
    BEGIN
        PERFORM upsert_user_profile(p_user_id, p_email, 'DSVI_ADMIN', p_name);
        RAISE NOTICE 'DEBUG: User profile created successfully';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'DEBUG: User profile creation failed: %', SQLERRM;
    END;
    
    -- Step 3: Grant permissions
    RAISE NOTICE 'DEBUG: Step 3 - Granting permissions. Count: %', array_length(p_permissions, 1);
    IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
        FOREACH permission_item IN ARRAY p_permissions
        LOOP
            RAISE NOTICE 'DEBUG: Granting permission: %', permission_item;
            SELECT grant_admin_permission(p_user_id, permission_item, NULL, p_created_by) INTO permission_result;
            RAISE NOTICE 'DEBUG: Permission result: %', permission_result;
            IF NOT (permission_result->>'success')::BOOLEAN THEN
                permission_errors := permission_errors || (permission_result->>'message');
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE 'DEBUG: No permissions to grant';
    END IF;
    
    -- Step 4: Assign schools
    RAISE NOTICE 'DEBUG: Step 4 - Assigning schools. Count: %', array_length(p_school_ids, 1);
    IF p_school_ids IS NOT NULL AND array_length(p_school_ids, 1) > 0 THEN
        FOREACH school_id IN ARRAY p_school_ids
        LOOP
            RAISE NOTICE 'DEBUG: Assigning school: %', school_id;
            SELECT assign_school_to_admin(p_user_id, school_id, p_created_by) INTO assignment_result;
            RAISE NOTICE 'DEBUG: Assignment result: %', assignment_result;
            IF NOT (assignment_result->>'success')::BOOLEAN THEN
                assignment_errors := assignment_errors || (assignment_result->>'message');
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE 'DEBUG: No schools to assign';
    END IF;
    
    -- Step 5: Verify final setup
    RAISE NOTICE 'DEBUG: Step 5 - Verifying setup...';
    SELECT verify_admin_setup(p_user_id) INTO final_result;
    RAISE NOTICE 'DEBUG: Verification result: %', final_result;
    
    -- Return comprehensive result
    RETURN json_build_object(
        'success', true,
        'profile_creation', profile_result,
        'setup_verification', final_result,
        'permission_errors', permission_errors,
        'assignment_errors', assignment_errors,
        'debug_info', json_build_object(
            'permissions_processed', array_length(p_permissions, 1),
            'schools_processed', array_length(p_school_ids, 1),
            'user_id', p_user_id,
            'email', p_email
        ),
        'message', 'Level 2 admin created successfully with debug info'
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'DEBUG: FATAL ERROR in create_level2_admin_complete: %', SQLERRM;
    RETURN json_build_object(
        'success', false, 
        'error', SQLERRM, 
        'message', 'Failed to create Level 2 admin - see logs for details'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the debug function
SELECT debug_create_level2_admin_complete(
    '22222222-2222-2222-2222-222222222222'::UUID,
    'debugtest@example.com',
    'Debug Test Admin',
    '11111111-1111-1111-1111-111111111111'::UUID,
    ARRAY['manage_schools']::TEXT[],
    ARRAY[]::UUID[],
    'Debug test admin creation'
) as debug_result;