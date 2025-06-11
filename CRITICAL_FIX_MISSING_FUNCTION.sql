-- CRITICAL MISSING FUNCTION: process_level2_admin_signup
-- This is the function that AuthContext is calling but doesn't exist

CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    invitation_record RECORD;
    create_result JSON;
    mark_result JSON;
    final_result JSON;
BEGIN
    -- Get invitation details from database
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND expires_at > NOW()
    AND is_used = FALSE
    AND email = p_email; -- Email must match
    
    IF NOT FOUND THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Invalid invitation: not found, expired, already used, or email mismatch'
        ) INTO final_result;
        
        RETURN final_result;
    END IF;
    
    -- Create the Level 2 admin with invitation details
    SELECT create_level2_admin_complete(
        p_user_id,
        invitation_record.email,
        invitation_record.name,
        invitation_record.created_by,
        invitation_record.permissions,
        invitation_record.school_ids,
        invitation_record.notes
    ) INTO create_result;
    
    IF (create_result->>'success')::BOOLEAN THEN
        -- Mark invitation as used
        SELECT mark_invitation_used(p_invite_token, p_user_id) INTO mark_result;
        
        SELECT json_build_object(
            'success', true,
            'admin_creation', create_result,
            'invitation_marked', mark_result,
            'message', 'Level 2 admin created successfully from database invitation'
        ) INTO final_result;
    ELSE
        -- Admin creation failed
        final_result := create_result;
    END IF;
    
    RETURN final_result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to process Level 2 admin signup'
    ) INTO final_result;
    
    RETURN final_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'CRITICAL FIX: process_level2_admin_signup function created!' as status;
