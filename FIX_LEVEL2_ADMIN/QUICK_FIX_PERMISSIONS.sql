-- ===============================================================================
-- QUICK CHECK: WHY PERMISSIONS/ASSIGNMENTS AREN'T CREATED
-- ===============================================================================

-- 1. Check if the tables exist and their structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('admin_permissions', 'admin_assignments')
AND column_name IN ('admin_user_id', 'permission_type', 'resource_id', 'school_id')
ORDER BY table_name, ordinal_position;

-- 2. Check for any unique constraints that might be blocking
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN (
    'admin_permissions'::regclass,
    'admin_assignments'::regclass
);

-- 3. Simple test - can we insert directly?
DO $$
DECLARE
    test_user UUID := gen_random_uuid();
BEGIN
    -- Test direct insert into admin_permissions
    BEGIN
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES (test_user, 'test_permission', NOW(), TRUE);
        
        IF EXISTS (SELECT 1 FROM admin_permissions WHERE admin_user_id = test_user) THEN
            RAISE NOTICE '✅ Direct insert to admin_permissions WORKS';
            DELETE FROM admin_permissions WHERE admin_user_id = test_user;
        ELSE
            RAISE NOTICE '❌ Record not found after insert';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Direct insert FAILED: %', SQLERRM;
    END;
END $$;

-- 4. The REAL fix - ensure permissions are created
-- Run this to update the process_level2_admin_signup function
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
BEGIN
    -- Create user profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'DSVI_ADMIN', updated_at = NOW();
    
    -- Create admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, created_at, is_active)
    VALUES (p_user_id, 2, p_user_id, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET admin_level = 2, is_active = TRUE;
    
    -- Create default permissions - DIRECT INSERT
    INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
    VALUES 
        (p_user_id, 'view_schools', NOW(), TRUE),
        (p_user_id, 'manage_content', NOW(), TRUE)
    ON CONFLICT DO NOTHING; -- Ignore if already exists
    
    RETURN json_build_object(
        'success', true,
        'message', 'Level 2 admin created with permissions'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Quick fix applied - test now!' as status;
