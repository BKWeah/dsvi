-- DIAGNOSTIC: Check if invitation system exists in database
-- Run this in Supabase SQL Editor to see what's missing

-- 1. Check if pending_admin_invitations table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') 
        THEN '✅ Table exists' 
        ELSE '❌ Table missing' 
    END as table_status;

-- 2. Check if create_admin_invitation function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_admin_invitation') 
        THEN '✅ Function exists' 
        ELSE '❌ Function missing' 
    END as function_status;

-- 3. Check if any invitations exist in the table (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_admin_invitations') THEN
        RAISE NOTICE 'Invitation count: %', (SELECT COUNT(*) FROM pending_admin_invitations);
        
        -- Show recent invitations
        IF EXISTS (SELECT 1 FROM pending_admin_invitations LIMIT 1) THEN
            RAISE NOTICE 'Recent invitations:';
            PERFORM 
                format('Email: %s, Token: %s, Created: %s', 
                       email, invite_token, created_at::text)
            FROM pending_admin_invitations 
            ORDER BY created_at DESC 
            LIMIT 3;
        ELSE
            RAISE NOTICE 'No invitations found in table';
        END IF;
    ELSE
        RAISE NOTICE 'Table does not exist - no invitations to check';
    END IF;
END $$;

-- 4. Test the create_admin_invitation function (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_admin_invitation') THEN
        RAISE NOTICE 'create_admin_invitation function exists and can be tested';
    ELSE
        RAISE NOTICE 'create_admin_invitation function is missing - this is the problem!';
    END IF;
END $$;

SELECT 'Diagnostic complete. Check the messages above.' as result;
