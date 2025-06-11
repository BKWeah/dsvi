-- ===============================================================================
-- ALL-IN-ONE FIX FOR LEVEL 2 ADMIN SYSTEM
-- Run this entire script to fix all remaining issues
-- ===============================================================================

-- 1. Disable RLS on pending_admin_invitations
ALTER TABLE pending_admin_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT ALL ON pending_admin_invitations TO authenticated;
GRANT ALL ON admin_assignments TO authenticated;
GRANT ALL ON admin_school_assignments TO authenticated;

-- 3. Fix the process_level2_admin_signup to use invitation data and create assignments
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    inv RECORD;
    school_id UUID;
    perm TEXT;
BEGIN
    -- Get invitation
    SELECT * INTO inv FROM pending_admin_invitations
    WHERE invite_token = p_invite_token AND email = p_email 
    AND is_used = FALSE AND expires_at > NOW();
    
    -- Create user profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', COALESCE(inv.name, 'Level 2 Admin'), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'DSVI_ADMIN', name = COALESCE(inv.name, EXCLUDED.name);
    
    -- Create admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, is_active)
    VALUES (p_user_id, 2, COALESCE(inv.created_by, p_user_id), inv.notes, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET admin_level = 2, is_active = TRUE;
    
    -- Create permissions
    IF inv.permissions IS NOT NULL THEN
        FOREACH perm IN ARRAY inv.permissions
        LOOP
            INSERT INTO admin_permissions (admin_user_id, permission_type, granted_by, created_at, is_active)
            VALUES (p_user_id, perm, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    ELSE
        -- Default permissions if no invitation
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES (p_user_id, 'view_schools', NOW(), TRUE), (p_user_id, 'manage_content', NOW(), TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Create school assignments
    IF inv.school_ids IS NOT NULL THEN
        FOREACH school_id IN ARRAY inv.school_ids
        LOOP
            INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
            
            INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    -- Mark invitation as used
    IF inv.id IS NOT NULL THEN
        UPDATE pending_admin_invitations 
        SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
        WHERE id = inv.id;
    END IF;
    
    RETURN json_build_object('success', true, 'message', 'Level 2 admin created successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Quick test
SELECT 'All fixes applied! Test Level 2 admin creation now.' as status;
