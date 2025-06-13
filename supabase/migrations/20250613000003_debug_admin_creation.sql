-- Debug Level 2 admin signup issue
-- Add debugging to understand why no admin records are created

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
    -- Log the input parameters
    RAISE NOTICE 'create_admin_from_invitation: user_id=%, token=%', p_user_id, p_invite_token;
    
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND expires_at > NOW()
    AND is_used = FALSE;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Invitation NOT FOUND for token: %', p_invite_token;
        
        -- Check if any invitations exist
        SELECT COUNT(*) INTO admin_id FROM pending_admin_invitations WHERE invite_token = p_invite_token;
        RAISE NOTICE 'Invitations with same token (any status): %', admin_id;
        
        SELECT json_build_object(
            'success', false,
            'message', 'Invitation not found, expired, or already used'
        ) INTO result;
        RETURN result;
    END IF;
    
    RAISE NOTICE 'Found invitation: email=%, admin_level=%', invitation_record.email, invitation_record.admin_level;    
    -- Check if admin record already exists
    SELECT id INTO existing_admin_id FROM dsvi_admins WHERE user_id = p_user_id;
    RAISE NOTICE 'Existing admin record: %', existing_admin_id;
    
    IF existing_admin_id IS NOT NULL THEN
        -- Update existing record
        UPDATE dsvi_admins
        SET admin_level = invitation_record.admin_level,
            permissions = COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
            school_ids = COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
            notes = invitation_record.notes, created_by = invitation_record.created_by,
            invite_token = p_invite_token, signup_completed_at = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id RETURNING id INTO admin_id;
        RAISE NOTICE 'Updated admin record: %', admin_id;
    ELSE
        -- Create new record
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
        RAISE NOTICE 'Created new admin record: %', admin_id;
    END IF;    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    RAISE NOTICE 'Marked invitation as used';
    
    SELECT json_build_object(
        'success', true, 'admin_id', admin_id,
        'message', 'Admin created/updated successfully',
        'action', CASE WHEN existing_admin_id IS NOT NULL THEN 'updated' ELSE 'created' END
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR in create_admin_from_invitation: %', SQLERRM;
    SELECT json_build_object(
        'success', false, 'error', SQLERRM,
        'message', 'Failed to create admin from invitation'
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Debug version deployed!' as status;