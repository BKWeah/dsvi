-- Migration: Fix Level 2 Admin Signup Process - Part 2 (CORRECTED v2)
-- Date: 2025-06-09
-- Purpose: Drop and recreate admin functions with correct signatures

-- ===============================================================================
-- 1. DROP EXISTING FUNCTIONS TO AVOID CONFLICTS
-- ===============================================================================
DROP FUNCTION IF EXISTS safe_create_admin_profile(UUID, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS safe_create_admin_profile(UUID, INTEGER, UUID);
DROP FUNCTION IF EXISTS verify_admin_setup(UUID);
DROP FUNCTION IF EXISTS grant_admin_permission(UUID, TEXT, UUID, UUID, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS grant_admin_permission(UUID, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS grant_admin_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS assign_school_to_admin(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS create_level2_admin_complete(UUID, TEXT, TEXT, UUID, TEXT[], UUID[], TEXT);

-- ===============================================================================
-- 2. CREATE SAFE ADMIN PROFILE FUNCTION
-- ===============================================================================
CREATE FUNCTION safe_create_admin_profile(
    p_user_id UUID,
    p_admin_level INTEGER,
    p_created_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    profile_id UUID;
    result JSON;
BEGIN
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = p_user_id) THEN
        UPDATE admin_profiles 
        SET admin_level = p_admin_level, created_by = p_created_by, notes = p_notes, updated_at = NOW(), is_active = TRUE
        WHERE user_id = p_user_id RETURNING id INTO profile_id;
        
        SELECT json_build_object('success', true, 'profile_id', profile_id, 'action', 'updated', 'message', 'Admin profile updated successfully') INTO result;
    ELSE
        INSERT INTO admin_profiles (user_id, admin_level, created_by, notes) VALUES (p_user_id, p_admin_level, p_created_by, p_notes) RETURNING id INTO profile_id;
        SELECT json_build_object('success', true, 'profile_id', profile_id, 'action', 'created', 'message', 'Admin profile created successfully') INTO result;
    END IF;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to create admin profile') INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ===============================================================================
-- 3. CREATE VERIFY ADMIN SETUP FUNCTION
-- ===============================================================================
CREATE FUNCTION verify_admin_setup(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    admin_profile_exists BOOLEAN := FALSE;
    admin_level INTEGER;
    permission_count INTEGER := 0;
    assignment_count INTEGER := 0;
    result JSON;
BEGIN
    SELECT ap.admin_level INTO admin_level FROM admin_profiles ap WHERE ap.user_id = p_user_id AND ap.is_active = TRUE;
    
    IF admin_level IS NOT NULL THEN
        admin_profile_exists := TRUE;
        SELECT COUNT(*) INTO permission_count FROM admin_permissions ap WHERE ap.admin_user_id = p_user_id AND ap.is_active = TRUE;
        SELECT COUNT(*) INTO assignment_count FROM admin_assignments aa WHERE aa.admin_user_id = p_user_id AND aa.is_active = TRUE;
    END IF;
    
    SELECT json_build_object(
        'success', admin_profile_exists,
        'admin_level', admin_level,
        'permission_count', permission_count,
        'assignment_count', assignment_count,
        'message', CASE WHEN admin_profile_exists THEN 'Admin setup verified successfully' ELSE 'Admin profile not found or not active' END
    ) INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to verify admin setup') INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ===============================================================================
-- 4. CREATE GRANT ADMIN PERMISSION FUNCTION
-- ===============================================================================
CREATE FUNCTION grant_admin_permission(
    target_user_id UUID,
    permission_type TEXT,
    resource_id UUID DEFAULT NULL,
    granted_by_user_id UUID DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    permission_id UUID;
    result JSON;
BEGIN
    INSERT INTO admin_permissions (admin_user_id, permission_type, resource_id, granted_by, expires_at)
    VALUES (target_user_id, permission_type, resource_id, granted_by_user_id, expires_at)
    ON CONFLICT (admin_user_id, permission_type, resource_id)
    DO UPDATE SET is_active = TRUE, granted_by = EXCLUDED.granted_by, expires_at = EXCLUDED.expires_at, created_at = NOW()
    RETURNING id INTO permission_id;
    
    SELECT json_build_object('success', true, 'permission_id', permission_id, 'message', 'Permission granted successfully') INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to grant permission') INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ===============================================================================
-- 5. CREATE ASSIGN SCHOOL TO ADMIN FUNCTION
-- ===============================================================================
CREATE FUNCTION assign_school_to_admin(
    target_user_id UUID,
    target_school_id UUID,
    assigned_by_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    assignment_id UUID;
    result JSON;
BEGIN
    INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by)
    VALUES (target_user_id, target_school_id, assigned_by_user_id)
    ON CONFLICT (admin_user_id, school_id)
    DO UPDATE SET is_active = TRUE, assigned_by = EXCLUDED.assigned_by, created_at = NOW()
    RETURNING id INTO assignment_id;
    
    SELECT json_build_object('success', true, 'assignment_id', assignment_id, 'message', 'School assignment created successfully') INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to assign school') INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Admin functions part 2 completed!' as status;