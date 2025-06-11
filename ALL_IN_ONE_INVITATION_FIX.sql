-- ALL-IN-ONE FIX: Complete Level 2 Admin Invitation System
-- Run this entire script in Supabase SQL Editor

-- 1. Create table if not exists
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_admin_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_admin_invitations(email);

-- 3. Create create_admin_invitation function
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
BEGIN
    -- Generate data
    v_invite_token := 'invite_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    v_email_hash := encode(p_email::bytea, 'base64');
    v_temp_password := 'TempPass' || substr(md5(random()::text), 1, 8);
    v_expires_at := NOW() + (p_days_valid || ' days')::interval;
    v_signup_link := '/level2-admin-signup?token=' || encode(v_invite_token::bytea, 'base64') || '&eh=' || v_email_hash;
    
    -- Insert invitation
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, permissions, school_ids, notes,
        created_by, expires_at, signup_link
    ) VALUES (
        p_email, p_name, v_invite_token, v_email_hash, v_temp_password,
        2, p_permissions, p_school_ids, p_notes,
        p_created_by, v_expires_at, v_signup_link
    ) RETURNING id INTO v_invitation_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'email', p_email,
        'name', p_name,
        'invite_token', v_invite_token,
        'email_hash', v_email_hash,
        'signup_link', v_signup_link,
        'temp_password', v_temp_password,
        'expires_at', v_expires_at
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create list_pending_invitations function
CREATE OR REPLACE FUNCTION list_pending_invitations()
RETURNS TABLE(
    id UUID, email TEXT, name TEXT, invite_token TEXT, email_hash TEXT,
    temp_password TEXT, permissions TEXT[], school_ids UUID[], notes TEXT,
    created_by UUID, created_at TIMESTAMP WITH TIME ZONE, expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN, signup_link TEXT, days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT pi.id, pi.email, pi.name, pi.invite_token, pi.email_hash,
           pi.temp_password, pi.permissions, pi.school_ids, pi.notes,
           pi.created_by, pi.created_at, pi.expires_at, pi.is_used, pi.signup_link,
           EXTRACT(DAY FROM (pi.expires_at - NOW()))::INTEGER
    FROM pending_admin_invitations pi
    WHERE pi.is_used = FALSE
    ORDER BY pi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create process_level2_admin_signup function
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
BEGIN
    -- Create admin profile directly
    INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
    VALUES (p_user_id, 2, NOW(), true)
    ON CONFLICT (user_id) DO UPDATE SET admin_level = 2, is_active = true;
    
    -- Create user profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = p_email, role = 'DSVI_ADMIN', updated_at = NOW();
    
    -- Mark invitation as used
    UPDATE pending_admin_invitations 
    SET is_used = true, used_at = NOW(), used_by = p_user_id
    WHERE invite_token = p_invite_token;
    
    RETURN json_build_object('success', true, 'message', 'Level 2 admin created');
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '🎉 ALL FUNCTIONS CREATED! Invitation system should work now!' as status;
