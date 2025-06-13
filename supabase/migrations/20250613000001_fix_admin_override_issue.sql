-- Fix Level 2 Admin Creation Override Issue
-- Date: 2025-06-13
-- Purpose: Fix upsert_user_profile overriding Level 2 admin creation

-- Update create_admin_from_invitation to handle existing admin records
CREATE OR REPLACE FUNCTION create_admin_from_invitation(
    p_user_id UUID,
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
        SELECT json_build_object(
            'success', false,
            'message', 'Invitation not found, expired, or already used'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Check if admin record already exists (from upsert_user_profile)
    SELECT id INTO existing_admin_id FROM dsvi_admins WHERE user_id = p_user_id;    
    IF existing_admin_id IS NOT NULL THEN
        -- Update existing admin record with invitation data
        UPDATE dsvi_admins
        SET 
            admin_level = invitation_record.admin_level,  -- Override to Level 2
            permissions = COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
            school_ids = COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
            notes = invitation_record.notes,
            created_by = invitation_record.created_by,
            invite_token = p_invite_token,
            signup_completed_at = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING id INTO admin_id;
        
        RAISE NOTICE 'Updated existing admin record ID: % with Level 2 data', admin_id;
    ELSE
        -- Create new admin record
        INSERT INTO dsvi_admins (
            user_id, email, name, admin_level, permissions, school_ids,
            notes, created_by, invite_token, signup_completed_at, is_active
        ) VALUES (
            p_user_id, invitation_record.email, invitation_record.name,
            invitation_record.admin_level,
            COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
            COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
            invitation_record.notes, invitation_record.created_by, 
            p_invite_token, NOW(), TRUE
        ) RETURNING id INTO admin_id;
        
        RAISE NOTICE 'Created new admin record ID: % with Level 2 data', admin_id;
    END IF;    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    SELECT json_build_object(
        'success', true,
        'admin_id', admin_id,
        'message', 'Admin created/updated successfully from invitation',
        'action', CASE WHEN existing_admin_id IS NOT NULL THEN 'updated' ELSE 'created' END,
        'debug_info', json_build_object(
            'admin_level_set', invitation_record.admin_level,
            'permissions_count', COALESCE(array_length(invitation_record.permissions, 1), 0),
            'schools_count', COALESCE(array_length(invitation_record.school_ids, 1), 0),
            'created_by', invitation_record.created_by
        )
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create/update admin from invitation'
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_admin_from_invitation(UUID, TEXT) IS 'Creates or updates admin record from invitation - handles existing records';

SELECT 'Level 2 admin override issue fixed!' as status;