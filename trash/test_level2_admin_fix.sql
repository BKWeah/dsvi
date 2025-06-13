-- Test Script to Verify Level 2 Admin Invitation Fix
-- Run this after creating and using a Level 2 invitation

-- 1. Check if functions exist with correct signatures
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as parameters
FROM pg_proc p
WHERE p.proname IN ('create_admin_invitation', 'create_admin_from_invitation', 'upsert_user_profile')
ORDER BY p.proname;

-- 2. Test invitation creation (replace with actual values)
-- SELECT create_admin_invitation(
--     'test@example.com',
--     'Test User',
--     'your-user-id-here',
--     ARRAY['manage_schools', 'view_reports'],
--     ARRAY['school-id-1', 'school-id-2'],
--     'Test invitation',
--     7,
--     'https://yourapp.com'
-- );

-- 3. Check pending invitations
SELECT email, name, admin_level, permissions, school_ids, is_used, created_at 
FROM pending_admin_invitations 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check actual admin records and their levels
SELECT user_id, email, name, admin_level, permissions, school_ids, 
       created_by, signup_completed_at, invite_token IS NOT NULL as from_invitation
FROM dsvi_admins 
WHERE admin_level = 2
ORDER BY created_at DESC;

-- 5. Verify no duplicate records exist
SELECT email, COUNT(*) as record_count
FROM dsvi_admins 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Expected results:
-- - Functions should have correct parameter signatures
-- - Level 2 admins should have admin_level = 2
-- - Permissions and school_ids should be populated
-- - No duplicate records by email
-- - signup_completed_at should be set for invitation-based admins
