-- QUICK FIX: Allow signup by disabling problematic trigger
-- Run this in Supabase SQL Editor to fix the signup 500 error

-- Disable the trigger that's causing signup failures
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;

-- Test that we can access the tables
SELECT 'Testing database access...' as test;
SELECT COUNT(*) as total_schools FROM schools;

SELECT 'Trigger disabled - signup should work now!' as status;
SELECT 'After successful signup, use the "Fix Admin Assignments" button.' as next_step;