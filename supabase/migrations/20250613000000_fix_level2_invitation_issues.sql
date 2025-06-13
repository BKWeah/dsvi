-- Migration: Fix Level 2 Invitation Issues
-- Date: 2025-06-13
-- Purpose: Fix hardcoded localhost URLs and data transfer issues

-- ===============================================================================
-- 1. FIX HARDCODED LOCALHOST URL IN INVITATION CREATION
-- ===============================================================================

-- Update the create_admin_invitation function to use dynamic domain
CREATE OR REPLACE FUNCTION create_admin_invitation(
    p_email TEXT,
    p_name TEXT,
    p_created_by UUID,
    p_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_notes TEXT DEFAULT NULL,
    p_days_valid INTEGER DEFAULT 7,
    p_base_url TEXT DEFAULT NULL -- Add base URL parameter for dynamic domains
)
RETURNS JSON AS $$
DECLARE
    v_invite_token TEXT;
    v_email_hash TEXT;
    v_temp_password TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_signup_link TEXT;
    v_invitation_id UUID;
    v_base_url TEXT;
    result JSON;
BEGIN
    -- Generate secure data
    v_invite_token := 'invite_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    v_email_hash := encode(p_email::bytea, 'base64');
    v_temp_password := 'TempPass' || substr(md5(random()::text), 1, 8);
    v_expires_at := NOW() + (p_days_valid || ' days')::interval;
    
    -- Use provided base URL or fallback to localhost for development
    v_base_url := COALESCE(p_base_url, 'http://localhost:3000');
    
    -- Generate signup link with dynamic base URL
    v_signup_link := v_base_url || '/level2-admin-signup?token=' || 
                     encode(v_invite_token::bytea, 'base64') || 
                     '&eh=' || v_email_hash || 
                     '&pwd=' || encode(v_temp_password::bytea, 'base64') || 
                     '&name=' || encode(p_name::bytea, 'base64');    
    -- Insert invitation into database
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, permissions, school_ids, notes,
        created_by, expires_at, signup_link
    ) VALUES (
        p_email, p_name, v_invite_token, v_email_hash, v_temp_password,
        2, p_permissions, p_school_ids, p_notes,
        p_created_by, v_expires_at, v_signup_link
    ) RETURNING id INTO v_invitation_id;
    
    -- Return success with invitation details
    SELECT json_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'email', p_email,
        'name', p_name,
        'invite_token', v_invite_token,
        'email_hash', v_email_hash,
        'signup_link', v_signup_link,
        'temp_password', v_temp_password,
        'expires_at', v_expires_at,
        'message', 'Invitation created successfully'
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create invitation'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 2. FIX DATA TRANSFER ISSUES IN ADMIN CREATION FROM INVITATION
-- ===============================================================================

-- Update the create_admin_from_invitation function with proper error handling
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
    -- Get invitation details with more detailed error checking
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND expires_at > NOW()
    AND is_used = FALSE;
    
    IF NOT FOUND THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Invitation not found, expired, or already used',
            'debug_info', json_build_object(
                'token', p_invite_token,
                'current_time', NOW()::text
            )
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Debug log the invitation data
    RAISE NOTICE 'Creating admin from invitation: email=%, name=%, admin_level=%, permissions=%, school_ids=%', 
                invitation_record.email, invitation_record.name, invitation_record.admin_level, 
                invitation_record.permissions, invitation_record.school_ids;    
    -- Create admin record with explicit values to prevent defaults from overriding
    INSERT INTO dsvi_admins (
        user_id, email, name, admin_level, permissions, school_ids,
        notes, created_by, invite_token, signup_completed_at, is_active
    ) VALUES (
        p_user_id, invitation_record.email, invitation_record.name,
        invitation_record.admin_level,  -- This should be 2 from the invitation
        COALESCE(invitation_record.permissions, ARRAY[]::TEXT[]),
        COALESCE(invitation_record.school_ids, ARRAY[]::UUID[]),
        invitation_record.notes, invitation_record.created_by, 
        p_invite_token, NOW(), TRUE
    ) RETURNING id INTO admin_id;
    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    -- Verify the created admin record
    RAISE NOTICE 'Admin record created with ID: %, verifying data...', admin_id;
    
    SELECT json_build_object(
        'success', true, 'admin_id', admin_id,
        'message', 'Admin created successfully from invitation',
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
        'success', false, 'error', SQLERRM,
        'message', 'Failed to create admin from invitation',
        'debug_info', json_build_object('user_id', p_user_id, 'invite_token', p_invite_token)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 3. ADD HELPER FUNCTION TO GET ADMIN DETAILS FOR DEBUGGING
-- ===============================================================================

CREATE OR REPLACE FUNCTION debug_admin_details(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    admin_record RECORD;
    result JSON;
BEGIN
    SELECT * INTO admin_record FROM dsvi_admins WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        SELECT json_build_object('found', false, 'message', 'No admin record found for this user_id') INTO result;
    ELSE
        SELECT json_build_object('found', true, 'admin_details', row_to_json(admin_record)) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 4. COMMENTS AND COMPLETION
-- ===============================================================================

COMMENT ON FUNCTION create_admin_invitation(TEXT, TEXT, UUID, TEXT[], UUID[], TEXT, INTEGER, TEXT) IS 'Creates admin invitation with dynamic base URL support';
COMMENT ON FUNCTION create_admin_from_invitation(UUID, TEXT) IS 'Creates admin record from invitation with proper data transfer and debugging';
COMMENT ON FUNCTION debug_admin_details(UUID) IS 'Debug function to check admin record details';

SELECT 'Level 2 invitation fixes completed successfully!' as status;