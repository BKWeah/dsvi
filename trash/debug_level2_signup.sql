-- Quick debug test for Level 2 admin signup issue
-- Run this to see what's happening

-- 1. Check current pending invitations
SELECT 'PENDING INVITATIONS:' as debug_section;
SELECT invite_token, email, name, admin_level, expires_at > NOW() as is_valid, is_used
FROM pending_admin_invitations 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check current admin records
SELECT 'ADMIN RECORDS:' as debug_section;
SELECT user_id, email, name, admin_level, invite_token IS NOT NULL as from_invitation
FROM dsvi_admins 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Test the function with a real invitation token (replace 'your-token-here')
-- SELECT 'FUNCTION TEST:' as debug_section;
-- SELECT create_admin_from_invitation('test-user-id', 'your-actual-invite-token-here');

-- 4. Check if the upsert_user_profile function is working correctly
SELECT 'FUNCTION SIGNATURES:' as debug_section;
SELECT p.proname as function_name, pg_get_function_identity_arguments(p.oid) as parameters
FROM pg_proc p
WHERE p.proname IN ('create_admin_from_invitation', 'upsert_user_profile', 'create_admin_invitation')
ORDER BY p.proname;

-- INSTRUCTIONS:
-- 1. Run this query to see current state
-- 2. Create a Level 2 invitation
-- 3. Try to sign up
-- 4. Check browser console for error messages
-- 5. Check server logs for NOTICE messages from the debug function
