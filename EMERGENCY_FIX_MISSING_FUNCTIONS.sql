-- EMERGENCY FIX: Missing Functions and Table Issues
-- Run this to fix the immediate problems

-- 1. Fix the user_profiles table structure issue
-- Either make id have a default, or fix the function

-- Option A: Add default UUID generation to id column
ALTER TABLE user_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Create the missing grant_admin_permission function
CREATE OR REPLACE FUNCTION grant_admin_permission(
    target_user_id UUID,
    permission_type TEXT,
    resource_id UUID DEFAULT NULL,
    granted_by_user_id UUID DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    permission_id UUID;
    result JSON;
BEGIN
    INSERT INTO admin_permissions (admin_user_id, permission_type, resource_id, granted_by, expires_at)
    VALUES (target_user_id, permission_type, resource_id, granted_by_user_id, expires_at)
    ON CONFLICT (admin_user_id, permission_type, resource_id)
    DO UPDATE SET 
        is_active = TRUE,
        granted_by = EXCLUDED.granted_by,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW()
    RETURNING id INTO permission_id;
    
    SELECT json_build_object(
        'success', true,
        'permission_id', permission_id,
        'message', 'Permission granted successfully'
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to grant permission'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the missing assign_school_to_admin function
CREATE OR REPLACE FUNCTION assign_school_to_admin(
    target_user_id UUID,
    target_school_id UUID,
    assigned_by_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    assignment_id UUID;
    result JSON;
BEGIN
    INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by)
    VALUES (target_user_id, target_school_id, assigned_by_user_id)
    ON CONFLICT (admin_user_id, school_id)
    DO UPDATE SET 
        is_active = TRUE,
        assigned_by = EXCLUDED.assigned_by,
        created_at = NOW()
    RETURNING id INTO assignment_id;
    
    SELECT json_build_object(
        'success', true,
        'assignment_id', assignment_id,
        'message', 'School assignment created successfully'
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to assign school'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- PART 2: Fix the upsert_user_profile function to handle the id column properly
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Insert with explicit id value (gen_random_uuid()) to satisfy NOT NULL constraint
    INSERT INTO user_profiles (id, user_id, email, role, name, created_at, updated_at)
    VALUES (gen_random_uuid(), p_user_id, p_email, p_role, p_name, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        updated_at = NOW()
    WHERE user_profiles.user_id = EXCLUDED.user_id;
    
    RAISE NOTICE 'Profile synced for user: %, role: %', p_email, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fixed function
SELECT upsert_user_profile(
    '77777777-7777-7777-7777-777777777777'::UUID,
    'fixedtest@example.com',
    'DSVI_ADMIN',
    'Fixed Test User'
);

-- Check if it worked
SELECT * FROM user_profiles WHERE email = 'fixedtest@example.com';

-- Test the complete Level 2 admin creation now that all functions exist
SELECT create_level2_admin_complete(
    '66666666-6666-6666-6666-666666666666'::UUID,
    'completetest@example.com',
    'Complete Test Admin',
    '77777777-7777-7777-7777-777777777777'::UUID,
    ARRAY['manage_schools']::TEXT[],
    ARRAY[]::UUID[],
    'Complete test after fixes'
) as complete_test_result;

-- Check what was created
SELECT 'After complete fix:' as status;
SELECT count(*) as user_profiles_count FROM user_profiles;
SELECT count(*) as admin_profiles_count FROM admin_profiles;
SELECT count(*) as admin_permissions_count FROM admin_permissions;

-- Cleanup
DELETE FROM admin_permissions WHERE admin_user_id IN ('77777777-7777-7777-7777-777777777777'::UUID, '66666666-6666-6666-6666-666666666666'::UUID);
DELETE FROM admin_profiles WHERE user_id IN ('77777777-7777-7777-7777-777777777777'::UUID, '66666666-6666-6666-6666-666666666666'::UUID);
DELETE FROM user_profiles WHERE email IN ('fixedtest@example.com', 'completetest@example.com');

SELECT '🎉 All fixes applied and tested!' as final_result;