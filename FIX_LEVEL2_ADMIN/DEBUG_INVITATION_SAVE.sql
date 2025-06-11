-- ===============================================================================
-- DEBUG: WHY INVITATIONS AREN'T BEING SAVED
-- ===============================================================================

-- 1. First check if auth.uid() returns a valid value
DO $$
BEGIN
    RAISE NOTICE 'Current auth.uid(): %', auth.uid();
    IF auth.uid() IS NULL THEN
        RAISE NOTICE '⚠️ WARNING: auth.uid() is NULL - this will cause issues!';
    END IF;
END $$;

-- 2. Test create_admin_invitation with a hardcoded user ID
DO $$
DECLARE
    test_result JSON;
    test_user_id UUID := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);
BEGIN
    RAISE NOTICE 'Testing create_admin_invitation with user_id: %', test_user_id;
    
    SELECT create_admin_invitation(
        'debug_test@example.com',
        'Debug Test Admin',
        test_user_id,
        ARRAY['view_schools', 'manage_content']::TEXT[],
        ARRAY[]::UUID[],
        'Debug test invitation',
        7
    ) INTO test_result;
    
    RAISE NOTICE 'Function result: %', test_result;
    
    -- Check if it was saved
    IF EXISTS (SELECT 1 FROM pending_admin_invitations WHERE email = 'debug_test@example.com') THEN
        RAISE NOTICE '✅ SUCCESS: Invitation was saved to database';
        
        -- Show what was saved
        FOR test_result IN 
            SELECT email, name, invite_token, created_by, expires_at
            FROM pending_admin_invitations 
            WHERE email = 'debug_test@example.com'
        LOOP
            RAISE NOTICE 'Saved invitation: %', test_result;
        END LOOP;
        
        -- Cleanup
        DELETE FROM pending_admin_invitations WHERE email = 'debug_test@example.com';
    ELSE
        RAISE NOTICE '❌ FAILED: Invitation was NOT saved to database';
        RAISE NOTICE 'Checking for any error in the result: %', test_result->>'error';
    END IF;
END $$;

-- 3. Check if there are ANY invitations in the table
SELECT 
    'Total invitations in table' as check_type,
    COUNT(*) as count
FROM pending_admin_invitations;

-- 4. Simple direct insert test (bypass function)
DO $$
DECLARE
    test_id UUID;
BEGIN
    RAISE NOTICE 'Testing direct insert...';
    
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, created_by, expires_at
    ) VALUES (
        'direct_insert@example.com',
        'Direct Insert Test',
        'direct_token_' || gen_random_uuid()::text,
        encode('direct_insert@example.com'::bytea, 'base64'),
        'DirectPass123',
        2,
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        NOW() + INTERVAL '7 days'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Direct insert successful with ID: %', test_id;
    
    -- Cleanup
    DELETE FROM pending_admin_invitations WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Direct insert failed: %', SQLERRM;
END $$;

-- 5. Check table owner and permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('authenticated', schemaname||'.'||tablename, 'INSERT') as can_insert
FROM pg_tables
WHERE tablename = 'pending_admin_invitations';
