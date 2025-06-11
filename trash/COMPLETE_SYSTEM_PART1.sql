-- COMPLETE END-TO-END LEVEL 2 ADMIN SYSTEM
-- This creates EVERYTHING needed for the full workflow
-- Run this entire script in Supabase SQL Editor

-- ===================================================================
-- STEP 1: CREATE PENDING INVITATIONS TABLE
-- ===================================================================
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

-- ===================================================================
-- STEP 2: CREATE INVITATION CREATION FUNCTION
-- ===================================================================
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
    
    -- Generate signup link (frontend will add base URL)
    v_signup_link := '/level2-admin-signup?token=' || 
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
        'message', 'Failed to create invitation: ' || SQLERRM
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Step 1-2: Invitation system created!' as status;
