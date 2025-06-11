-- CREATE MISSING list_pending_invitations FUNCTION
-- Run this in Supabase SQL Editor

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

SELECT 'list_pending_invitations function created!' as status;
