-- Verification and Data Migration Script (FIXED)
-- Run this manually in Supabase SQL Editor to verify the consolidated admin system

-- ===============================================================================
-- 1. VERIFY FUNCTIONS EXIST
-- ===============================================================================
SELECT 'Checking if functions exist...' as status;

-- List all our new functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_admin_by_user_id',
    'get_admin_level_new',
    'has_admin_permission_new',
    'get_assigned_schools_new',
    'create_admin_from_invitation',
    'list_level2_admins',
    'update_admin',
    'update_admin_last_login'
);

-- ===============================================================================
-- 2. CHECK IF EXISTING ADMIN NEEDS MIGRATION
-- ===============================================================================
SELECT 'Checking existing admin data...' as status;

-- Check if user b67095ca-0ed3-4378-a08d-af1407bb923a exists in old tables
SELECT 'Old admin_profiles table:' as check_type, COUNT(*) as count
FROM admin_profiles 
WHERE user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';

-- Check if already in new table
SELECT 'New dsvi_admins table:' as check_type, COUNT(*) as count
FROM dsvi_admins 
WHERE user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';

-- ===============================================================================
-- 3. MANUAL MIGRATION FOR EXISTING ADMIN (IF NEEDED)
-- ===============================================================================

-- Get user details from auth.users
SELECT 'User details from auth.users:' as info, 
       id, email, raw_user_meta_data->>'name' as name, 
       raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';

-- If the admin exists in old table but not new table, migrate manually
DO $$
DECLARE
    existing_admin_count INTEGER;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Check if user exists in old admin_profiles but not in new dsvi_admins
    SELECT COUNT(*) INTO existing_admin_count
    FROM admin_profiles ap
    WHERE ap.user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a'
    AND NOT EXISTS (
        SELECT 1 FROM dsvi_admins da 
        WHERE da.user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a'
    );
    
    IF existing_admin_count > 0 THEN
        -- Get user details
        SELECT au.email, COALESCE(au.raw_user_meta_data->>'name', au.email) 
        INTO user_email, user_name
        FROM auth.users au 
        WHERE au.id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';
        
        -- Create Level 1 admin in consolidated table
        INSERT INTO dsvi_admins (
            user_id, email, name, admin_level, 
            permissions, school_ids, notes, is_active,
            created_at, updated_at
        ) VALUES (
            'b67095ca-0ed3-4378-a08d-af1407bb923a',
            user_email,
            user_name,
            1, -- Level 1 (Super Admin)
            ARRAY[]::TEXT[], -- Level 1 has all permissions
            ARRAY[]::UUID[], -- Level 1 has access to all schools
            'Migrated from old admin system',
            TRUE,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Successfully migrated admin % to consolidated table', user_email;
    ELSE
        -- Check if user doesn't exist in either table - create them directly
        SELECT COUNT(*) INTO existing_admin_count
        FROM dsvi_admins da 
        WHERE da.user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';
        
        IF existing_admin_count = 0 THEN
            -- User doesn't exist in new table either, create them
            SELECT au.email, COALESCE(au.raw_user_meta_data->>'name', au.email) 
            INTO user_email, user_name
            FROM auth.users au 
            WHERE au.id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';
            
            IF user_email IS NOT NULL THEN
                INSERT INTO dsvi_admins (
                    user_id, email, name, admin_level, 
                    permissions, school_ids, notes, is_active,
                    created_at, updated_at
                ) VALUES (
                    'b67095ca-0ed3-4378-a08d-af1407bb923a',
                    user_email,
                    user_name,
                    1, -- Level 1 (Super Admin)
                    ARRAY[]::TEXT[], -- Level 1 has all permissions
                    ARRAY[]::UUID[], -- Level 1 has access to all schools
                    'Created in consolidated admin system',
                    TRUE,
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE 'Successfully created new admin % in consolidated table', user_email;
            ELSE
                RAISE NOTICE 'User not found in auth.users table';
            END IF;
        ELSE
            RAISE NOTICE 'Admin already exists in consolidated table';
        END IF;
    END IF;
END $$;

-- ===============================================================================
-- 4. VERIFY MIGRATION SUCCESS
-- ===============================================================================
SELECT 'Final verification...' as status;

-- Test the new functions
SELECT 'Testing get_admin_level_new:' as test_name,
       get_admin_level_new('b67095ca-0ed3-4378-a08d-af1407bb923a') as admin_level;

-- Test get_admin_by_user_id
SELECT 'Testing get_admin_by_user_id:' as test_name,
       (SELECT jsonb_agg(to_jsonb(t)) FROM get_admin_by_user_id('b67095ca-0ed3-4378-a08d-af1407bb923a') t) as admin_data;

-- Show final state
SELECT 'Final admin state:' as info, *
FROM dsvi_admins 
WHERE user_id = 'b67095ca-0ed3-4378-a08d-af1407bb923a';

SELECT 'Admin system consolidation verification completed!' as status;
