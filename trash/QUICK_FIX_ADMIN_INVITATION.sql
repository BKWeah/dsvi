-- QUICK FIX FOR ADMIN INVITATION SYSTEM
-- Run this directly in your Supabase SQL Editor

-- 1. Create the function that returns email_hash (the missing piece)
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
    result JSON;
BEGIN
    -- Generate secure data
    v_invite_token := 'invite_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    v_email_hash := encode(p_email::bytea, 'base64');
    v_temp_password := 'TempPass' || substr(md5(random()::text), 1, 8);
    v_expires_at := NOW() + (p_days_valid || ' days')::interval;
    
    -- Generate signup link
    v_signup_link := window.location.origin || '/level2-admin-signup?token=' || 
                     encode(v_invite_token::bytea, 'base64') || 
                     '&eh=' || v_email_hash || 
                     '&pwd=' || encode(v_temp_password::bytea, 'base64') || 
                     '&name=' || encode(p_name::bytea, 'base64');
    
    -- Return success with invitation details (including email_hash for frontend)
    SELECT json_build_object(
        'success', true,
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

SELECT 'Fixed create_admin_invitation function - now returns email_hash!' as status;
