-- Migration: Consolidate Admin System to Single Table
-- Date: 2025-06-11
-- Purpose: Simplify admin management by consolidating multiple tables into one

-- ===============================================================================
-- 1. CREATE NEW CONSOLIDATED ADMIN TABLE
-- ===============================================================================
CREATE TABLE IF NOT EXISTS dsvi_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    admin_level INTEGER NOT NULL CHECK (admin_level IN (1, 2)) DEFAULT 2,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Additional fields for tracking
    invite_token TEXT, -- Keep track of original invitation
    signup_completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT dsvi_admins_user_id_key UNIQUE (user_id),
    CONSTRAINT dsvi_admins_email_key UNIQUE (email)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_user_id ON dsvi_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_email ON dsvi_admins(email);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_admin_level ON dsvi_admins(admin_level);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_is_active ON dsvi_admins(is_active);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_school_ids ON dsvi_admins USING GIN(school_ids);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_permissions ON dsvi_admins USING GIN(permissions);

-- Enable RLS
ALTER TABLE dsvi_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "dsvi_admins_can_read_all" ON dsvi_admins;
CREATE POLICY "dsvi_admins_can_read_all" ON dsvi_admins
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

DROP POLICY IF EXISTS "level1_admins_can_manage_all" ON dsvi_admins;
CREATE POLICY "level1_admins_can_manage_all" ON dsvi_admins
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN' AND
  EXISTS (
    SELECT 1 FROM dsvi_admins da 
    WHERE da.user_id = auth.uid() 
    AND da.admin_level = 1 
    AND da.is_active = TRUE
  )
);

DROP POLICY IF EXISTS "admins_can_read_own_profile" ON dsvi_admins;
CREATE POLICY "admins_can_read_own_profile" ON dsvi_admins
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_update_own_last_login" ON dsvi_admins;
CREATE POLICY "admins_can_update_own_last_login" ON dsvi_admins
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===============================================================================
-- 2. DATA MIGRATION FROM OLD TABLES
-- ===============================================================================

-- Migrate existing admin profiles with their permissions and assignments
INSERT INTO dsvi_admins (
    user_id, 
    email, 
    name, 
    admin_level, 
    permissions, 
    school_ids, 
    notes, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
)
SELECT DISTINCT
    ap.user_id,
    COALESCE(au.email, 'admin-' || ap.user_id::text || '@dsvi.com') as email,
    COALESCE(au.raw_user_meta_data->>'name', 'Admin ' || SUBSTRING(ap.user_id::text, 1, 8)) as name,
    ap.admin_level,
    COALESCE(
        ARRAY(
            SELECT DISTINCT apr.permission_type 
            FROM admin_permissions apr 
            WHERE apr.admin_user_id = ap.user_id 
            AND apr.is_active = TRUE
        ), 
        ARRAY[]::TEXT[]
    ) as permissions,
    COALESCE(
        ARRAY(
            SELECT DISTINCT aa.school_id 
            FROM admin_assignments aa 
            WHERE aa.admin_user_id = ap.user_id 
            AND aa.is_active = TRUE
        ), 
        ARRAY[]::UUID[]
    ) as school_ids,
    ap.notes,
    ap.is_active,
    ap.created_by,
    ap.created_at,
    ap.updated_at
FROM admin_profiles ap
LEFT JOIN auth.users au ON au.id = ap.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM dsvi_admins da WHERE da.user_id = ap.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ===============================================================================
-- 3. NEW SIMPLIFIED FUNCTIONS
-- ===============================================================================

-- Function to get admin details by user_id
CREATE OR REPLACE FUNCTION get_admin_by_user_id(p_user_id UUID)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    email TEXT,
    name TEXT,
    admin_level INTEGER,
    permissions TEXT[],
    school_ids UUID[],
    notes TEXT,
    is_active BOOLEAN,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.id, da.user_id, da.email, da.name, da.admin_level,
        da.permissions, da.school_ids, da.notes, da.is_active,
        da.created_by, da.created_at, da.updated_at, da.last_login
    FROM dsvi_admins da
    WHERE da.user_id = p_user_id AND da.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin level
CREATE OR REPLACE FUNCTION get_admin_level_new(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    admin_level INTEGER;
BEGIN
    SELECT da.admin_level INTO admin_level
    FROM dsvi_admins da
    WHERE da.user_id = p_user_id AND da.is_active = TRUE;
    
    RETURN COALESCE(admin_level, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_admin_permission_new(
    p_user_id UUID,
    p_permission_type TEXT,
    p_school_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_record RECORD;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Get admin details
    SELECT admin_level, permissions, school_ids INTO admin_record
    FROM dsvi_admins
    WHERE user_id = p_user_id AND is_active = TRUE;
    
    -- If no admin record found, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Level 1 admins have all permissions
    IF admin_record.admin_level = 1 THEN
        RETURN TRUE;
    END IF;
    
    -- Level 2 admins need specific permissions
    IF admin_record.admin_level = 2 THEN
        -- Check if they have the permission
        has_permission := p_permission_type = ANY(admin_record.permissions);
        
        -- If permission is school-specific, also check school assignment
        IF has_permission AND p_school_id IS NOT NULL THEN
            has_permission := p_school_id = ANY(admin_record.school_ids);
        END IF;
        
        RETURN has_permission;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get schools assigned to admin
CREATE OR REPLACE FUNCTION get_assigned_schools_new(p_user_id UUID)
RETURNS UUID[] AS $$
DECLARE
    school_ids UUID[];
BEGIN
    SELECT da.school_ids INTO school_ids
    FROM dsvi_admins da
    WHERE da.user_id = p_user_id AND da.is_active = TRUE;
    
    RETURN COALESCE(school_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin from invitation
CREATE OR REPLACE FUNCTION create_admin_from_invitation(
    p_user_id UUID,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    invitation_record RECORD;
    admin_id UUID;
    result JSON;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND expires_at > NOW()
    AND is_used = FALSE;
    
    IF NOT FOUND THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Invitation not found, expired, or already used'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Create admin record
    INSERT INTO dsvi_admins (
        user_id, email, name, admin_level, permissions, school_ids,
        notes, created_by, invite_token, signup_completed_at
    ) VALUES (
        p_user_id, invitation_record.email, invitation_record.name,
        invitation_record.admin_level, invitation_record.permissions,
        invitation_record.school_ids, invitation_record.notes,
        invitation_record.created_by, p_invite_token, NOW()
    ) RETURNING id INTO admin_id;
    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    SELECT json_build_object(
        'success', true,
        'admin_id', admin_id,
        'message', 'Admin created successfully from invitation'
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create admin from invitation'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all level 2 admins
CREATE OR REPLACE FUNCTION list_level2_admins()
RETURNS TABLE(
    id UUID,
    user_id UUID,
    email TEXT,
    name TEXT,
    admin_level INTEGER,
    permissions TEXT[],
    school_ids UUID[],
    notes TEXT,
    is_active BOOLEAN,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    permissions_count INTEGER,
    schools_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.id, da.user_id, da.email, da.name, da.admin_level,
        da.permissions, da.school_ids, da.notes, da.is_active,
        da.created_by, da.created_at, da.updated_at, da.last_login,
        array_length(da.permissions, 1) as permissions_count,
        array_length(da.school_ids, 1) as schools_count
    FROM dsvi_admins da
    WHERE da.admin_level = 2
    ORDER BY da.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin
CREATE OR REPLACE FUNCTION update_admin(
    p_user_id UUID,
    p_permissions TEXT[] DEFAULT NULL,
    p_school_ids UUID[] DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE dsvi_admins
    SET 
        permissions = COALESCE(p_permissions, permissions),
        school_ids = COALESCE(p_school_ids, school_ids),
        notes = COALESCE(p_notes, notes),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Admin not found'
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', true,
            'message', 'Admin updated successfully'
        ) INTO result;
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to update admin'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_admin_last_login(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE dsvi_admins 
    SET last_login = NOW() 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 4. UPDATE EXISTING FUNCTIONS TO USE NEW TABLE
-- ===============================================================================

-- Update the upsert_user_profile function to work with new table
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- For DSVI_ADMIN roles, ensure they have an admin record
    IF p_role = 'DSVI_ADMIN' THEN
        -- Check if admin record exists
        IF NOT EXISTS (SELECT 1 FROM dsvi_admins WHERE user_id = p_user_id) THEN
            -- Create Level 1 admin profile for existing DSVI admins (backward compatibility)
            INSERT INTO dsvi_admins (user_id, email, name, admin_level)
            VALUES (p_user_id, p_email, p_name, 1)
            ON CONFLICT (user_id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                updated_at = NOW();
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 5. CLEANUP - DROP OLD TABLES (OPTIONAL - COMMENT OUT IF YOU WANT TO KEEP BACKUP)
-- ===============================================================================

-- Uncomment these lines after confirming migration worked correctly:
-- DROP TABLE IF EXISTS admin_permissions CASCADE;
-- DROP TABLE IF EXISTS admin_assignments CASCADE;  
-- DROP TABLE IF EXISTS admin_profiles CASCADE;

-- ===============================================================================
-- 6. COMMENTS AND COMPLETION
-- ===============================================================================
COMMENT ON TABLE dsvi_admins IS 'Consolidated admin table containing all admin information, permissions, and assignments';
COMMENT ON FUNCTION get_admin_by_user_id(UUID) IS 'Get complete admin details by user_id';
COMMENT ON FUNCTION get_admin_level_new(UUID) IS 'Get admin level for user (1=Super Admin, 2=Assigned Staff, 0=Not Admin)';
COMMENT ON FUNCTION has_admin_permission_new(UUID, TEXT, UUID) IS 'Check if user has specific permission, with optional school scope';
COMMENT ON FUNCTION get_assigned_schools_new(UUID) IS 'Get array of school IDs assigned to admin';
COMMENT ON FUNCTION create_admin_from_invitation(UUID, TEXT) IS 'Create admin record from pending invitation';
COMMENT ON FUNCTION list_level2_admins() IS 'List all Level 2 admins with summary stats';
COMMENT ON FUNCTION update_admin(UUID, TEXT[], UUID[], TEXT, BOOLEAN) IS 'Update admin permissions, schools, notes, and status';

SELECT 'Admin system consolidation migration completed successfully!' as status;
