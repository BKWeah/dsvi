-- Check if the created_by user exists in auth.users

-- See what created_by value is in the invitation
SELECT 'Invitation created_by:' as info;
SELECT email, name, created_by 
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';

-- Check if this user exists in auth.users  
SELECT 'created_by user in auth.users:' as info;
SELECT au.id, au.email
FROM auth.users au
JOIN pending_admin_invitations pai ON pai.created_by = au.id
WHERE pai.email = 'test.level2@example.com';

-- If no result above, the foreign key constraint is failing
-- Let's check what users exist in auth.users
SELECT 'Available auth.users:' as info;
SELECT id, email, created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;
