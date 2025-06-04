-- Migration: Add Admin Levels System
-- This migration adds the infrastructure for Level 1 (Super Admin) and Level 2 (Assigned Staff) admin system
-- Date: 2025-06-04

-- Create admin_profiles table to store additional admin information
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_level INTEGER NOT NULL CHECK (admin_level IN (1, 2)),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Create admin_permissions table to store what Level 2 admins can access
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL,
    resource_id UUID, -- For school-specific permissions, this would be school_id
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure unique permission per admin per resource
    UNIQUE(admin_user_id, permission_type, resource_id)
);

-- Create admin_assignments table to track which schools Level 2 admins are assigned to
CREATE TABLE IF NOT EXISTS admin_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure unique assignment per admin per school
    UNIQUE(admin_user_id, school_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_admin_level ON admin_profiles(admin_level);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_user_id ON admin_permissions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_permission_type ON admin_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_admin_user_id ON admin_assignments(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_school_id ON admin_assignments(school_id);

-- Function to get admin level for a user
CREATE OR REPLACE FUNCTION get_admin_level(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    admin_level INTEGER;
BEGIN
    SELECT ap.admin_level INTO admin_level
    FROM admin_profiles ap
    WHERE ap.user_id = get_admin_level.user_id AND ap.is_active = TRUE;
    
    RETURN COALESCE(admin_level, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_admin_permission(
    user_id UUID,
    permission_type TEXT,
    resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_level INTEGER;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Get user's admin level
    SELECT get_admin_level(user_id) INTO user_level;
    
    -- Level 1 admins have all permissions
    IF user_level = 1 THEN
        RETURN TRUE;
    END IF;
    
    -- Level 2 admins need specific permissions
    IF user_level = 2 THEN
        SELECT EXISTS(
            SELECT 1 FROM admin_permissions ap
            WHERE ap.admin_user_id = has_admin_permission.user_id
            AND ap.permission_type = has_admin_permission.permission_type
            AND (has_admin_permission.resource_id IS NULL OR ap.resource_id = has_admin_permission.resource_id)
            AND ap.is_active = TRUE
            AND (ap.expires_at IS NULL OR ap.expires_at > NOW())
        ) INTO has_permission;
        
        RETURN has_permission;
    END IF;
    
    -- No admin level or other levels
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get schools assigned to a Level 2 admin
CREATE OR REPLACE FUNCTION get_assigned_schools(user_id UUID)
RETURNS TABLE(school_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT aa.school_id
    FROM admin_assignments aa
    WHERE aa.admin_user_id = get_assigned_schools.user_id
    AND aa.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin profile (used when creating new DSVI admins)
CREATE OR REPLACE FUNCTION create_admin_profile(
    target_user_id UUID,
    admin_level INTEGER,
    created_by_user_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Insert admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes)
    VALUES (target_user_id, admin_level, created_by_user_id, notes)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        admin_level = EXCLUDED.admin_level,
        updated_at = NOW(),
        notes = EXCLUDED.notes
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant permission to Level 2 admin
CREATE OR REPLACE FUNCTION grant_admin_permission(
    target_user_id UUID,
    permission_type TEXT,
    resource_id UUID DEFAULT NULL,
    granted_by_user_id UUID DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    permission_id UUID;
BEGIN
    INSERT INTO admin_permissions (admin_user_id, permission_type, resource_id, granted_by, expires_at)
    VALUES (target_user_id, permission_type, resource_id, granted_by_user_id, expires_at)
    ON CONFLICT (admin_user_id, permission_type, resource_id)
    DO UPDATE SET 
        is_active = TRUE,
        granted_by = EXCLUDED.granted_by,
        expires_at = EXCLUDED.expires_at
    RETURNING id INTO permission_id;
    
    RETURN permission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign school to Level 2 admin
CREATE OR REPLACE FUNCTION assign_school_to_admin(
    target_user_id UUID,
    target_school_id UUID,
    assigned_by_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
BEGIN
    INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by)
    VALUES (target_user_id, target_school_id, assigned_by_user_id)
    ON CONFLICT (admin_user_id, school_id)
    DO UPDATE SET 
        is_active = TRUE,
        assigned_by = EXCLUDED.assigned_by
    RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing upsert_user_profile function to handle admin levels
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- For DSVI_ADMIN roles, we need to check if they have an admin profile
    -- If not, we'll create them as Level 1 admin by default (for backward compatibility)
    IF p_role = 'DSVI_ADMIN' THEN
        -- Check if admin profile exists
        IF NOT EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = p_user_id) THEN
            -- Create Level 1 admin profile for existing DSVI admins
            INSERT INTO admin_profiles (user_id, admin_level, created_at, updated_at)
            VALUES (p_user_id, 1, NOW(), NOW());
        END IF;
    END IF;
    
    -- Note: We don't need to insert into a users table since we're using Supabase Auth
    -- This function now just ensures admin profiles are created for DSVI admins
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE admin_profiles IS 'Stores additional profile information for DSVI admin users, including their admin level';
COMMENT ON TABLE admin_permissions IS 'Stores specific permissions granted to Level 2 admins';
COMMENT ON TABLE admin_assignments IS 'Tracks which schools Level 2 admins are assigned to manage';

COMMENT ON FUNCTION get_admin_level(UUID) IS 'Returns the admin level (1 or 2) for a given user, or 0 if not an admin';
COMMENT ON FUNCTION has_admin_permission(UUID, TEXT, UUID) IS 'Checks if a user has a specific permission, considering their admin level';
COMMENT ON FUNCTION get_assigned_schools(UUID) IS 'Returns the list of school IDs assigned to a Level 2 admin';
COMMENT ON FUNCTION create_admin_profile(UUID, INTEGER, UUID, TEXT) IS 'Creates or updates an admin profile for a user';
COMMENT ON FUNCTION grant_admin_permission(UUID, TEXT, UUID, UUID, TIMESTAMP WITH TIME ZONE) IS 'Grants a specific permission to a Level 2 admin';
COMMENT ON FUNCTION assign_school_to_admin(UUID, UUID, UUID) IS 'Assigns a school to a Level 2 admin for management';
