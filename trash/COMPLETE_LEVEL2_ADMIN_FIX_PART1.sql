-- COMPREHENSIVE FIX FOR LEVEL 2 ADMIN SIGNUP
-- This script creates all missing functions for the invitation system

-- ========================================================================
-- 1. CREATE PENDING ADMIN INVITATIONS TABLE (if not exists)
-- ========================================================================
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

-- ========================================================================
-- 2. CREATE SUPPORTING FUNCTIONS (if not exist)
-- ========================================================================

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
