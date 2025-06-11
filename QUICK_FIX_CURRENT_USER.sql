-- QUICK FIX: Run this now to fix the current user
-- Replace 'olutao@yahoo.com' with the actual email that just signed up

SELECT create_level2_admin_complete(
    (SELECT id FROM auth.users WHERE email = 'olutao@yahoo.com'), -- Replace email here
    'olutao@yahoo.com', -- Replace email here
    'Admin Olu', -- Replace name here
    (SELECT id FROM auth.users WHERE email = 'olutao@yahoo.com'), -- Replace email here
    ARRAY['manage_schools', 'view_reports']::TEXT[],
    ARRAY[]::UUID[],
    'Manual Level 2 admin creation after signup fix'
) as creation_result;

-- Verify it worked
SELECT 'VERIFICATION:' as status;
SELECT 
    'user_profiles: ' || count(*) as result 
FROM user_profiles 
WHERE email = 'olutao@yahoo.com'; -- Replace email here

SELECT 
    'admin_profiles: ' || count(*) as result 
FROM admin_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'olutao@yahoo.com'); -- Replace email here

SELECT 
    'Admin level: ' || COALESCE(admin_level::text, 'NOT FOUND') as result
FROM admin_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'olutao@yahoo.com'); -- Replace email here

SELECT '✅ Done! User should now have full Level 2 admin access.' as final_status;
