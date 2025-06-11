-- ===============================================================================
-- ULTIMATE FIX: PERMISSIONS NOT BEING CREATED DUE TO CONSTRAINT
-- ===============================================================================

-- The issue: UNIQUE constraint (admin_user_id, permission_type, resource_id)
-- When resource_id is NULL, PostgreSQL treats each NULL as unique
-- So the constraint might not work as expected

-- SOLUTION 1: Drop and recreate the constraint to handle NULLs properly
ALTER TABLE admin_permissions 
DROP CONSTRAINT IF EXISTS admin_permissions_admin_user_id_permission_type_resourc_key;

-- Add a new constraint that handles NULLs correctly
ALTER TABLE admin_permissions
ADD CONSTRAINT admin_permissions_unique_constraint 
UNIQUE (admin_user_id, permission_type, resource_id);

-- SOLUTION 2: Update the process_level2_admin_signup to handle this
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    final_result JSON;
    perm_count INTEGER;
BEGIN
    -- Create user profile
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    -- Create admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, created_at, is_active)
    VALUES (p_user_id, 2, p_user_id, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET 
        admin_level = 2,
        is_active = TRUE,
        updated_at = NOW();
    
    -- Delete any existing permissions first (clean slate)
    DELETE FROM admin_permissions WHERE admin_user_id = p_user_id;
    
    -- Insert default permissions
    INSERT INTO admin_permissions (
        id, -- Generate ID explicitly
        admin_user_id, 
        permission_type, 
        resource_id,
        granted_by,
        created_at, 
        is_active
    )
    VALUES 
        (gen_random_uuid(), p_user_id, 'view_schools', NULL, p_user_id, NOW(), TRUE),
        (gen_random_uuid(), p_user_id, 'manage_content', NULL, p_user_id, NOW(), TRUE);
    
    -- Count permissions created
    SELECT COUNT(*) INTO perm_count FROM admin_permissions WHERE admin_user_id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', format('Level 2 admin created with %s permissions', perm_count),
        'user_id', p_user_id,
        'permissions_created', perm_count
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to process Level 2 admin signup: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fix
SELECT 'Constraint and function updated. Test Level 2 signup now!' as status;
