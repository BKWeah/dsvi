-- Migration: Add Admin Invitation System
-- Date: 2025-06-09
-- Purpose: Create database-based invitation system for Level 2 admins

-- ===============================================================================
-- 1. CREATE PENDING ADMIN INVITATIONS TABLE
-- ===============================================================================
CREATE TABLE IF NOT EXISTS pending_admin_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    invite_token TEXT NOT NULL UNIQUE,
    email_hash TEXT NOT NULL,
    temp_password TEXT NOT NULL,
    admin_level INTEGER NOT NULL DEFAULT 2,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id),
    signup_link TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_admin_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires ON pending_admin_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_used ON pending_admin_invitations(is_used);

-- Enable RLS
ALTER TABLE pending_admin_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "dsvi_admins_can_manage_invitations" ON pending_admin_invitations
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- Public can read their own invitation (for signup validation)
CREATE POLICY "public_can_read_own_invitation" ON pending_admin_invitations
FOR SELECT USING (
  invite_token IS NOT NULL AND
  expires_at > NOW() AND
  is_used = FALSE
);

-- ===============================================================================
-- 2. CREATE ADMIN INVITATION FUNCTION
-- ===============================================================================
CREATE OR REPLACE FUNCTION create_admin_invitation(
    p_email TEXT,
    p_name TEXT,
    p_created_by UUID,
    p_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_notes TEXT DEFAULT NULL,
    p_days_valid INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
    v_invite_token TEXT;
    v_email_hash TEXT;
    v_temp_password TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_signup_link TEXT;
    v_invitation_id UUID;
    result JSON;
BEGIN
    -- Generate secure data
    v_invite_token := 'invite_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    v_email_hash := encode(p_email::bytea, 'base64');
    v_temp_password := 'TempPass' || substr(md5(random()::text), 1, 8);
    v_expires_at := NOW() + (p_days_valid || ' days')::interval;
    
    -- Generate signup link
    v_signup_link := 'http://localhost:3000/level2-admin-signup?token=' || 
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
    
    -- Return success with invitation details (including email_hash for frontend)
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
-- 3. SUPPORTING FUNCTIONS
-- ===============================================================================

-- Function to validate and retrieve invitation from database
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

-- Function to mark invitation as used
CREATE OR REPLACE FUNCTION mark_invitation_used(
    p_invite_token TEXT,
    p_used_by UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE pending_admin_invitations
    SET is_used = TRUE,
        used_at = NOW(),
        used_by = p_used_by
    WHERE invite_token = p_invite_token
    AND is_used = FALSE;
    
    IF NOT FOUND THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Invitation not found or already used'
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', true,
            'message', 'Invitation marked as used'
        ) INTO result;
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to mark invitation as used'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list pending invitations (for admin interface)
CREATE OR REPLACE FUNCTION list_pending_invitations()
RETURNS TABLE(
    id UUID,
    email TEXT,
    name TEXT,
    invite_token TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pi.id,
        pi.email,
        pi.name,
        pi.invite_token,
        pi.created_by,
        pi.created_at,
        pi.expires_at,
        pi.is_used,
        EXTRACT(DAY FROM (pi.expires_at - NOW()))::INTEGER as days_until_expiry
    FROM pending_admin_invitations pi
    WHERE pi.is_used = FALSE
    ORDER BY pi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 4. COMMENTS AND COMPLETION
-- ===============================================================================
COMMENT ON TABLE pending_admin_invitations IS 'Stores Level 2 admin invitations in database instead of localStorage';
COMMENT ON FUNCTION create_admin_invitation IS 'Creates a new Level 2 admin invitation stored in database';
COMMENT ON FUNCTION get_invitation_by_token IS 'Retrieves and validates invitation by token';
COMMENT ON FUNCTION mark_invitation_used IS 'Marks invitation as used after successful signup';
COMMENT ON FUNCTION list_pending_invitations IS 'Lists all pending (unused) invitations for admin interface';

SELECT 'Admin invitation system migration completed successfully!' as status;
