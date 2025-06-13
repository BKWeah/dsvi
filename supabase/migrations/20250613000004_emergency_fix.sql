-- EMERGENCY FIX for Level 2 Admin Signup
-- Date: 2025-06-13
-- Purpose: Fix critical issues causing signup failures

-- 1. Fix upsert_user_profile function call issue by making parameter optional with proper signature
DROP FUNCTION IF EXISTS upsert_user_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN);

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
    
    RAISE NOTICE 'upsert_user_profile completed: role=%, skip=%', p_role, p_skip_admin_creation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix RLS policy recursion issue on dsvi_admins table
DROP POLICY IF EXISTS "admins_can_update_own_last_login" ON dsvi_admins;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "admins_can_update_own_last_login" ON dsvi_admins
FOR UPDATE USING (
  user_id = auth.uid() AND 
  auth.role() = 'authenticated'
) WITH CHECK (
  user_id = auth.uid() AND 
  auth.role() = 'authenticated'
);

SELECT 'Emergency fixes applied!' as status;
