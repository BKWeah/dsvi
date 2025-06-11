-- Migration: Fix Level 2 Admin Signup Process - Part 3 (CORRECTED v2)
-- Date: 2025-06-09
-- Purpose: Comprehensive function and final setup

-- ===============================================================================
-- 1. CREATE COMPREHENSIVE LEVEL 2 ADMIN CREATION FUNCTION
-- ===============================================================================
CREATE FUNCTION create_level2_admin_complete(
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
    -- Create admin profile
    SELECT safe_create_admin_profile(p_user_id, 2, p_created_by, p_notes) INTO profile_result;
    
    IF NOT (profile_result->>'success')::BOOLEAN THEN
        RETURN profile_result;
    END IF;
    
    -- Create user profile entry
    PERFORM upsert_user_profile(p_user_id, p_email, 'DSVI_ADMIN', p_name);
    
    -- Grant permissions (continue even if individual permissions fail)
    IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
        FOREACH permission_item IN ARRAY p_permissions
        LOOP
            SELECT grant_admin_permission(p_user_id, permission_item, NULL, p_created_by) INTO permission_result;
            IF NOT (permission_result->>'success')::BOOLEAN THEN
                permission_errors := permission_errors || (permission_result->>'message');
            END IF;
        END LOOP;
    END IF;
    -- Assign schools (continue even if individual assignments fail)
    IF p_school_ids IS NOT NULL AND array_length(p_school_ids, 1) > 0 THEN
        FOREACH school_id IN ARRAY p_school_ids
        LOOP
            SELECT assign_school_to_admin(p_user_id, school_id, p_created_by) INTO assignment_result;
            IF NOT (assignment_result->>'success')::BOOLEAN THEN
                assignment_errors := assignment_errors || (assignment_result->>'message');
            END IF;
        END LOOP;
    END IF;
    
    -- Verify final setup
    SELECT verify_admin_setup(p_user_id) INTO final_result;
    
    RETURN json_build_object(
        'success', true,
        'profile_creation', profile_result,
        'setup_verification', final_result,
        'permission_errors', permission_errors,
        'assignment_errors', assignment_errors,
        'message', 'Level 2 admin created successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to create Level 2 admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 2. ADD INDEXES AND COMMENTS
-- ===============================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

COMMENT ON FUNCTION safe_create_admin_profile(UUID, INTEGER, UUID, TEXT) IS 'Safely creates or updates admin profile with error handling';
COMMENT ON FUNCTION verify_admin_setup(UUID) IS 'Verifies that admin setup is complete';
COMMENT ON FUNCTION create_level2_admin_complete(UUID, TEXT, TEXT, UUID, TEXT[], UUID[], TEXT) IS 'Complete Level 2 admin creation';

SELECT 'Level 2 admin signup fix migration completed successfully!' as status;