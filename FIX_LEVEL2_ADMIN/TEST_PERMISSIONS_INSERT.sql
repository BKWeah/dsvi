-- ===============================================================================
-- TEST WHAT'S BLOCKING PERMISSIONS
-- Run this to see the exact error
-- ===============================================================================

-- 1. First, let's see what happens with a simple insert
DO $$
DECLARE
    test_user UUID := '99999999-9999-9999-9999-999999999999'::UUID;
BEGIN
    -- Clean up first
    DELETE FROM admin_permissions WHERE admin_user_id = test_user;
    
    -- Try to insert a permission
    BEGIN
        RAISE NOTICE 'Attempting to insert permission...';
        
        INSERT INTO admin_permissions (
            admin_user_id,
            permission_type,
            resource_id,
            created_at,
            is_active
        ) VALUES (
            test_user,
            'view_schools',
            NULL,
            NOW(),
            TRUE
        );
        
        RAISE NOTICE '✅ First permission inserted successfully';
        
        -- Try to insert another
        INSERT INTO admin_permissions (
            admin_user_id,
            permission_type,
            resource_id,
            created_at,
            is_active
        ) VALUES (
            test_user,
            'manage_content',
            NULL,
            NOW(),
            TRUE
        );
        
        RAISE NOTICE '✅ Second permission inserted successfully';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Insert failed with error: %', SQLERRM;
        RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    END;
    
    -- Check what was created
    PERFORM COUNT(*) FROM admin_permissions WHERE admin_user_id = test_user;
    RAISE NOTICE 'Permissions created: %', COUNT(*) FROM admin_permissions WHERE admin_user_id = test_user;
    
    -- Clean up
    DELETE FROM admin_permissions WHERE admin_user_id = test_user;
END $$;

-- 2. Check if there's a missing column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'admin_permissions'
ORDER BY ordinal_position;

-- 3. Show the exact constraint definition
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'admin_permissions'::regclass;
