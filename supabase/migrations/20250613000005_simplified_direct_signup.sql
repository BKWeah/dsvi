-- SIMPLIFIED Level 2 Admin Signup - Direct Approach
-- Date: 2025-06-13
-- Purpose: Create Level 2 admin directly, eliminate dual-function complexity

-- Create single function for direct Level 2 admin creation
CREATE OR REPLACE FUNCTION signup_level2_admin_directly(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
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
        RAISE NOTICE 'DIRECT: Invitation not found for token: %', p_invite_token;
        SELECT json_build_object('success', false, 'message', 'Invitation not found') INTO result;
        RETURN result;
    END IF;
    
    RAISE NOTICE 'DIRECT: Creating Level 2 admin for user: %', p_user_id;    
    -- Create admin record directly (NO conflicts, NO race conditions)
    INSERT INTO dsvi_admins (
        user_id, email, name, admin_level, permissions, school_ids,
        notes, created_by, invite_token, signup_completed_at, is_active
    ) VALUES (
        p_user_id, p_email, p_name, invitation_record.admin_level,
        COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
        COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
        invitation_record.notes, invitation_record.created_by,
        p_invite_token, NOW(), TRUE
    ) RETURNING id INTO admin_id;
    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    RAISE NOTICE 'DIRECT: Level 2 admin created with ID: %', admin_id;
    
    SELECT json_build_object(
        'success', true, 'admin_id', admin_id,
        'admin_level', invitation_record.admin_level,
        'message', 'Level 2 admin created directly'
    ) INTO result;
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'DIRECT ERROR: %', SQLERRM;
    SELECT json_build_object('success', false, 'error', SQLERRM) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable auto-creation in upsert_user_profile by default
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT,
    p_skip_admin_creation BOOLEAN DEFAULT TRUE  -- Default TRUE = no auto-creation
)
RETURNS VOID AS $$
BEGIN
    -- Only create admin if explicitly requested (rare case)
    IF p_role = 'DSVI_ADMIN' AND NOT p_skip_admin_creation THEN
        IF NOT EXISTS (SELECT 1 FROM dsvi_admins WHERE user_id = p_user_id) THEN
            INSERT INTO dsvi_admins (user_id, email, name, admin_level)
            VALUES (p_user_id, p_email, p_name, 1)
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END IF;
    
    RAISE NOTICE 'upsert_user_profile: No auto-creation for user: %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION signup_level2_admin_directly(UUID, TEXT, TEXT, TEXT) IS 'Direct Level 2 admin creation - eliminates conflicts';

SELECT 'Simplified direct signup approach implemented!' as status;