-- Update upsert_user_profile to accept skip parameter
-- Date: 2025-06-13
-- Purpose: Add skip parameter to prevent auto admin creation

CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT,
    p_skip_admin_creation BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    -- For DSVI_ADMIN roles, ensure they have an admin record ONLY if not skipping
    IF p_role = 'DSVI_ADMIN' AND NOT p_skip_admin_creation THEN
        -- Check if admin record exists
        IF NOT EXISTS (SELECT 1 FROM dsvi_admins WHERE user_id = p_user_id) THEN
            -- Create Level 1 admin profile for existing DSVI admins (backward compatibility)
            INSERT INTO dsvi_admins (user_id, email, name, admin_level)
            VALUES (p_user_id, p_email, p_name, 1)
            ON CONFLICT (user_id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                updated_at = NOW();
        END IF;
    END IF;
    
    RAISE NOTICE 'upsert_user_profile: role=%, skip_admin_creation=%', p_role, p_skip_admin_creation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION upsert_user_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN) IS 'User profile sync with optional admin creation skip';

SELECT 'upsert_user_profile updated with skip parameter!' as status;
