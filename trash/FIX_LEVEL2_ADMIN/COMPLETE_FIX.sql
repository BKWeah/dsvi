-- ===============================================================================
-- COMPLETE FIX FOR LEVEL 2 ADMIN SIGNUP
-- This creates ALL missing functions and fixes the signup process
-- ===============================================================================

-- 1. First, create/update the upsert_user_profile function
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, p_role, p_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the safe_create_admin_profile function
CREATE OR REPLACE FUNCTION safe_create_admin_profile(
    p_user_id UUID,
    p_admin_level INTEGER,
    p_created_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    profile_id UUID;
BEGIN
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, updated_at)
    VALUES (p_user_id, p_admin_level, p_created_by, p_notes, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        admin_level = EXCLUDED.admin_level,
        updated_at = NOW(),
        notes = COALESCE(EXCLUDED.notes, admin_profiles.notes)
    RETURNING id INTO profile_id;
    
    RETURN json_build_object(
        'success', true,
        'profile_id', profile_id,
        'message', 'Admin profile created/updated successfully'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create admin profile'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the grant_admin_permission function
CREATE OR REPLACE FUNCTION grant_admin_permission(
    p_admin_user_id UUID,
    p_permission_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_granted_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    permission_id UUID;
BEGIN
    INSERT INTO admin_permissions (admin_user_id, permission_type, resource_id, granted_by, created_at)
    VALUES (p_admin_user_id, p_permission_type, p_resource_id, p_granted_by, NOW())
    ON CONFLICT (admin_user_id, permission_type, resource_id) DO UPDATE SET
        is_active = true,
        granted_by = COALESCE(EXCLUDED.granted_by, admin_permissions.granted_by)
    RETURNING id INTO permission_id;
    
    RETURN json_build_object(
        'success', true,
        'permission_id', permission_id,
        'message', 'Permission granted successfully'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to grant permission'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the assign_school_to_admin function
CREATE OR REPLACE FUNCTION assign_school_to_admin(
    p_admin_user_id UUID,
    p_school_id UUID,
    p_assigned_by UUID
)
RETURNS JSON AS $$
DECLARE
    assignment_id UUID;
BEGIN
    -- Insert into admin_assignments
    INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at)
    VALUES (p_admin_user_id, p_school_id, p_assigned_by, NOW())
    ON CONFLICT (admin_user_id, school_id) DO UPDATE SET
        is_active = true,
        assigned_by = COALESCE(EXCLUDED.assigned_by, admin_assignments.assigned_by)
    RETURNING id INTO assignment_id;
    
    -- Also insert into admin_school_assignments if that table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_school_assignments') THEN
        INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at)
        VALUES (p_admin_user_id, p_school_id, p_assigned_by, NOW())
        ON CONFLICT (admin_user_id, school_id) DO UPDATE SET
            is_active = true,
            assigned_by = COALESCE(EXCLUDED.assigned_by, admin_school_assignments.assigned_by);
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'assignment_id', assignment_id,
        'message', 'School assigned successfully'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to assign school'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the verify_admin_setup function
CREATE OR REPLACE FUNCTION verify_admin_setup(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    has_user_profile BOOLEAN;
    has_admin_profile BOOLEAN;
    admin_level INTEGER;
    permission_count INTEGER;
    school_count INTEGER;
BEGIN
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = p_user_id) INTO has_user_profile;
    SELECT EXISTS(SELECT 1 FROM admin_profiles WHERE user_id = p_user_id) INTO has_admin_profile;
    SELECT ap.admin_level FROM admin_profiles ap WHERE ap.user_id = p_user_id INTO admin_level;
    SELECT COUNT(*) FROM admin_permissions WHERE admin_user_id = p_user_id INTO permission_count;
    SELECT COUNT(*) FROM admin_assignments WHERE admin_user_id = p_user_id INTO school_count;
    
    RETURN json_build_object(
        'success', true,
        'has_user_profile', has_user_profile,
        'has_admin_profile', has_admin_profile,
        'admin_level', admin_level,
        'permission_count', permission_count,
        'school_count', school_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the MAIN create_level2_admin_complete function
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
    permission_errors TEXT[] := ARRAY[]::TEXT[];
    assignment_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Step 1: Create user profile
    PERFORM upsert_user_profile(p_user_id, p_email, 'DSVI_ADMIN', p_name);
    
    -- Step 2: Create admin profile
    SELECT safe_create_admin_profile(p_user_id, 2, p_created_by, p_notes) INTO profile_result;
    
    IF NOT (profile_result->>'success')::BOOLEAN THEN
        RETURN profile_result;
    END IF;
    
    -- Step 3: Grant permissions (if any)
    IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
        FOREACH permission_item IN ARRAY p_permissions
        LOOP
            SELECT grant_admin_permission(p_user_id, permission_item, NULL, p_created_by) INTO permission_result;
            IF NOT (permission_result->>'success')::BOOLEAN THEN
                permission_errors := permission_errors || (permission_result->>'message');
            END IF;
        END LOOP;
    END IF;
    
    -- Step 4: Assign schools (if any)
    IF p_school_ids IS NOT NULL AND array_length(p_school_ids, 1) > 0 THEN
        FOREACH school_id IN ARRAY p_school_ids
        LOOP
            SELECT assign_school_to_admin(p_user_id, school_id, p_created_by) INTO assignment_result;
            IF NOT (assignment_result->>'success')::BOOLEAN THEN
                assignment_errors := assignment_errors || (assignment_result->>'message');
            END IF;
        END LOOP;
    END IF;
    
    -- Step 5: Verify final setup
    SELECT verify_admin_setup(p_user_id) INTO final_result;
    
    RETURN json_build_object(
        'success', true,
        'user_id', p_user_id,
        'profile_creation', profile_result,
        'setup_verification', final_result,
        'permission_errors', permission_errors,
        'assignment_errors', assignment_errors,
        'message', 'Level 2 admin created successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create Level 2 admin: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add helpful comments
COMMENT ON FUNCTION upsert_user_profile IS 'Creates or updates user profile record';
COMMENT ON FUNCTION safe_create_admin_profile IS 'Safely creates admin profile with error handling';
COMMENT ON FUNCTION grant_admin_permission IS 'Grants specific permission to admin';
COMMENT ON FUNCTION assign_school_to_admin IS 'Assigns school to Level 2 admin';
COMMENT ON FUNCTION verify_admin_setup IS 'Verifies admin setup is complete';
COMMENT ON FUNCTION create_level2_admin_complete IS 'Complete Level 2 admin creation process';

SELECT 'All functions created successfully!' as status;
