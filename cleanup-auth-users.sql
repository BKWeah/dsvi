-- CLEAN UP AUTH USERS: Remove all authenticated users from cloud
-- ⚠️ WARNING: This will delete ALL users from your cloud database
-- Run this in your Supabase SQL Editor ONLY if you want to start fresh

-- First, let's see what users exist
SELECT 'Current users before cleanup:' as step;
SELECT id, email, created_at, 
       raw_user_meta_data->>'role' as role,
       email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
ORDER BY created_at;

-- Delete all users (this cascades and removes related data)
-- UNCOMMENT THE LINE BELOW ONLY IF YOU WANT TO DELETE ALL USERS:
DELETE FROM auth.users;

-- Verify cleanup (should return 0 users)
-- SELECT 'Users after cleanup:' as step;
-- SELECT COUNT(*) as remaining_users FROM auth.users;

-- Instructions for manual cleanup via Supabase Dashboard:
SELECT '⚠️ MANUAL CLEANUP INSTRUCTIONS:' as note,
       '1. Go to Authentication > Users in your Supabase dashboard' as step1,
       '2. Select all users and delete them manually' as step2,
       '3. This is safer than running DELETE FROM auth.users' as step3;

SELECT 'Auth cleanup script ready!' as status;
