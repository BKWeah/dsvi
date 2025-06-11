-- COMPLETE SYSTEM PART 2: List and Signup Functions

-- ===================================================================
-- STEP 3: CREATE LIST PENDING INVITATIONS FUNCTION
-- ===================================================================
CREATE OR REPLACE FUNCTION list_pending_invitations()
RETURNS TABLE(
    id UUID,
    email TEXT,
    name TEXT,
    invite_token TEXT,
    email_hash TEXT,
    temp_password TEXT,
    permissions TEXT[],
    school_ids UUID[],
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN,
    signup_link TEXT,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pi.id,
        pi.email,
        pi.name,
        pi.invite_token,
        pi.email_hash,
        pi.temp_password,
        pi.permissions,
        pi.school_ids,
        pi.notes,
        pi.created_by,
        pi.created_at,
        pi.expires_at,
        pi.is_used,
        pi.signup_link,
        EXTRACT(DAY FROM (pi.expires_at - NOW()))::INTEGER as days_until_expiry
    FROM pending_admin_invitations pi
    WHERE pi.is_used = FALSE
    ORDER BY pi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- STEP 4: CREATE INVITATION VALIDATION FUNCTION
-- ===================================================================
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_invite_token TEXT)
RETURNS JSON AS $$
DECLARE
    invitation_record RECORD;
    result JSON;
BEGIN
    -- Look up invitation by token
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
    ELSE
        SELECT json_build_object(
            'success', true,
            'invitation', row_to_json(invitation_record),
            'message', 'Invitation found and valid'
        ) INTO result;
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to retrieve invitation'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Step 3-4: List and validation functions created!' as status;
