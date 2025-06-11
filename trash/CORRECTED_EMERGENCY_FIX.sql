-- CORRECTED EMERGENCY FIX: Use Real User IDs for Testing
-- Run this to fix the issues with proper user references

-- 1. First, let's see what users actually exist in auth.users
SELECT 'Existing users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Fix the user_profiles table structure issue
ALTER TABLE user_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Create the missing grant_admin_permission function
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
-- 4. Create the missing assign_school_to_admin function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fix the upsert_user_profile function
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Insert with explicit id value to satisfy NOT NULL constraint
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