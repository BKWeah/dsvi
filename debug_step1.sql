-- DEBUG: Level 2 Admin Signup Issue
-- Step 1: First run this test to see what happens

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN (
    'create_level2_admin_complete',
    'safe_create_admin_profile', 
    'upsert_user_profile',
    'grant_admin_permission',
    'assign_school_to_admin',
    'verify_admin_setup'
) ORDER BY routine_name;

-- Test basic user_profiles insert
INSERT INTO user_profiles (email, role, name) 
VALUES ('debug@test.com', 'DSVI_ADMIN', 'Debug User')
ON CONFLICT (email) DO NOTHING;

SELECT * FROM user_profiles WHERE email = 'debug@test.com';
