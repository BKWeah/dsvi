-- COMPREHENSIVE DIAGNOSTIC: Check entire Level 2 Admin workflow
-- Run this in Supabase SQL Editor to identify ALL issues

SELECT '=== PHASE 1: INVITATION SYSTEM DIAGNOSTIC ===' as phase;

-- 1. Check if pending_admin_invitations table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') 
        THEN '✅ Table exists' 
        ELSE '❌ Table missing' 
    END as table_status;

-- 2. Check table structure if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') THEN
        RAISE NOTICE '✅ Table columns:';
        FOR rec IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'pending_admin_invitations'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (%)', rec.column_name, rec.data_type, 
                CASE WHEN rec.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
        END LOOP;
    END IF;
END $$;

-- 3. Check if create_admin_invitation function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_admin_invitation') 
        THEN '✅ Function exists' 
        ELSE '❌ Function missing' 
    END as function_status;

-- 4. Check function parameters if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_admin_invitation') THEN
        RAISE NOTICE '✅ Function parameters:';
        FOR rec IN 
            SELECT parameter_name, data_type, parameter_mode
            FROM information_schema.parameters 
            WHERE specific_name IN (
                SELECT specific_name 
                FROM information_schema.routines 
                WHERE routine_name = 'create_admin_invitation'
            )
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (%)', rec.parameter_name, rec.data_type, rec.parameter_mode;
        END LOOP;
    END IF;
END $$;

-- 5. Count existing invitations
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations')
        THEN (SELECT COUNT(*)::text || ' invitations found' FROM pending_admin_invitations)
        ELSE 'Table does not exist'
    END as invitation_count;

-- 6. Show recent invitations if any
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') THEN
        IF EXISTS (SELECT 1 FROM pending_admin_invitations LIMIT 1) THEN
            RAISE NOTICE '✅ Recent invitations:';
            FOR rec IN 
                SELECT email, name, invite_token, created_at, is_used
                FROM pending_admin_invitations 
                ORDER BY created_at DESC 
                LIMIT 3
            LOOP
                RAISE NOTICE '  - %: % (token: %, used: %)', 
                    rec.email, rec.name, substring(rec.invite_token, 1, 20) || '...', rec.is_used;
            END LOOP;
        ELSE
            RAISE NOTICE '⚠️ Table exists but no invitations found';
        END IF;
    END IF;
END $$;

SELECT '=== PHASE 2: ADMIN SYSTEM DIAGNOSTIC ===' as phase;

-- 7. Check admin_profiles table
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') 
        THEN '✅ admin_profiles table exists' 
        ELSE '❌ admin_profiles table missing' 
    END as admin_profiles_status;

-- 8. Check user_profiles table
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
        THEN '✅ user_profiles table exists' 
        ELSE '❌ user_profiles table missing' 
    END as user_profiles_status;

-- 9. Check process_level2_admin_signup function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'process_level2_admin_signup') 
        THEN '✅ process_level2_admin_signup function exists' 
        ELSE '❌ process_level2_admin_signup function missing' 
    END as signup_function_status;

-- 10. Check list_pending_invitations function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'list_pending_invitations') 
        THEN '✅ list_pending_invitations function exists' 
        ELSE '❌ list_pending_invitations function missing' 
    END as list_function_status;

SELECT '=== DIAGNOSTIC COMPLETE ===' as result;
SELECT 'Check the messages above for detailed results' as instruction;
