-- ===============================================================================
-- FIND THE EXACT PROBLEM WITH PERMISSIONS
-- ===============================================================================

-- 1. Check if admin_permissions table has all required columns
SELECT 
    'admin_permissions structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'admin_permissions'
AND column_name IN ('id', 'admin_user_id', 'permission_type', 'resource_id', 'created_at', 'is_active')
ORDER BY ordinal_position;

-- 2. Look for any recent errors in the function execution
-- This will show what the current function is trying to do
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'process_level2_admin_signup';

-- 3. The working fix - just replace the function
DROP FUNCTION IF EXISTS process_level2_admin_signup(UUID, TEXT, TEXT);

CREATE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    perm_count INTEGER := 0;
BEGIN
    -- User profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', split_part(p_email, '@', 1), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'DSVI_ADMIN', updated_at = NOW();
    
    -- Admin profile  
    INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
    VALUES (p_user_id, 2, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET admin_level = 2, is_active = TRUE;
    
    -- Permissions - use a different approach
    WITH perms AS (
        SELECT unnest(ARRAY['view_schools', 'manage_content']) as perm_type
    )
    INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
    SELECT p_user_id, perm_type, NOW(), TRUE FROM perms
    ON CONFLICT DO NOTHING;
    
    -- Count what we created
    SELECT COUNT(*) INTO perm_count 
    FROM admin_permissions 
    WHERE admin_user_id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Admin created with ' || perm_count || ' permissions'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Test it immediately
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    result JSON;
BEGIN
    SELECT process_level2_admin_signup(test_id, 'finaltest@example.com', 'token') INTO result;
    RAISE NOTICE 'Result: %', result;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_id;
    DELETE FROM admin_profiles WHERE user_id = test_id;  
    DELETE FROM user_profiles WHERE id = test_id;
END $$;

SELECT 'Function replaced. Test Level 2 admin signup NOW!' as message;
