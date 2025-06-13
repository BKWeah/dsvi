-- Fix direct signup function to handle existing users
-- Date: 2025-06-13
-- Purpose: Handle case where user exists but needs admin record created

-- Update the direct signup function to handle existing admin records
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
    existing_admin_id UUID;
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
    
    RAISE NOTICE 'DIRECT: Processing Level 2 admin for user: %', p_user_id;    
    -- Check if admin record already exists
    SELECT id INTO existing_admin_id FROM dsvi_admins WHERE user_id = p_user_id;
    
    IF existing_admin_id IS NOT NULL THEN
        -- Update existing admin record with Level 2 data
        UPDATE dsvi_admins
        SET admin_level = invitation_record.admin_level,
            permissions = COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
            school_ids = COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
            notes = invitation_record.notes, created_by = invitation_record.created_by,
            invite_token = p_invite_token, signup_completed_at = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id RETURNING id INTO admin_id;
        RAISE NOTICE 'DIRECT: Updated existing admin record: %', admin_id;
    ELSE
        -- Create new admin record
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
        RAISE NOTICE 'DIRECT: Created new admin record: %', admin_id;
    END IF;    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    SELECT json_build_object(
        'success', true, 'admin_id', admin_id, 'admin_level', invitation_record.admin_level,
        'action', CASE WHEN existing_admin_id IS NOT NULL THEN 'updated' ELSE 'created' END,
        'message', 'Level 2 admin processed successfully'
    ) INTO result;
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'DIRECT ERROR: %', SQLERRM;
    SELECT json_build_object('success', false, 'error', SQLERRM) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Direct signup function updated to handle existing users!' as status;