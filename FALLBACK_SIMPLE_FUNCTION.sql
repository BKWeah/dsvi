-- FALLBACK: If create_level2_admin_complete doesn't exist either

CREATE OR REPLACE FUNCTION process_level2_admin_signup_simple(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
BEGIN
    -- Create admin profile directly
    INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
    VALUES (p_user_id, 2, NOW(), true)
    ON CONFLICT (user_id) DO UPDATE SET
        admin_level = 2,
        is_active = true;
    
    -- Create user profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = p_email,
        role = 'DSVI_ADMIN',
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Level 2 admin created successfully (simplified)'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create Level 2 admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use this version if the main function fails
-- ALTER FUNCTION process_level2_admin_signup RENAME TO process_level2_admin_signup_backup;
-- ALTER FUNCTION process_level2_admin_signup_simple RENAME TO process_level2_admin_signup;
