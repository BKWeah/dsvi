-- Simple debug: Check current invitations and create a fresh one

-- 1. See what invitations currently exist
SELECT email, is_used, expires_at > NOW() as not_expired, created_at
FROM pending_admin_invitations 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check specifically for our test email
SELECT * FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';

-- 3. Clean up and create fresh invitation
DELETE FROM pending_admin_invitations WHERE email = 'test.level2@example.com';

-- 4. Check if create_admin_invitation function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'create_admin_invitation';

-- 5. Check if we have required data (users and schools)
SELECT 'Users count:' as info, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Schools count:' as info, COUNT(*) as count FROM schools;
