-- MANUAL ADMIN PROFILE CREATION
-- Run this to manually create the admin profile for the user who just signed up
-- Replace the email with the actual email of the user who just signed up

-- 1. Find the user who just signed up (replace 'actual@email.com' with the real email)
DO $$
DECLARE
    signup_user_id UUID;
    signup_email TEXT := 'olutao@yahoo.com'; -- REPLACE WITH ACTUAL EMAIL
    create_result JSON;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO signup_user_id 
    FROM auth.users 
    WHERE email = signup_email;
    
    IF signup_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found in auth.users', signup_email;
    ELSE
        RAISE NOTICE 'Found user: % with ID: %', signup_email, signup_user_id;
        
        -- Create the complete Level 2 admin profile
        SELECT create_level2_admin_complete(
            signup_user_id,
            signup_email,
            'Admin Olu', -- Replace with actual name if different
            signup_user_id, -- Use same user as creator for now
            ARRAY['manage_schools', 'view_reports']::TEXT[], -- Standard Level 2 permissions
            ARRAY[]::UUID[], -- No specific schools for now
            'Manually created Level 2 admin profile after signup'
        ) INTO create_result;
        
        RAISE NOTICE 'Level 2 admin creation result: %', create_result;
        
        -- Verify what was created
        RAISE NOTICE 'Verification:';
        RAISE NOTICE '- user_profiles count: %', (SELECT count(*) FROM user_profiles WHERE user_id = signup_user_id);
        RAISE NOTICE '- admin_profiles count: %', (SELECT count(*) FROM admin_profiles WHERE user_id = signup_user_id);
        RAISE NOTICE '- admin_permissions count: %', (SELECT count(*) FROM admin_permissions WHERE admin_user_id = signup_user_id);
        
        -- Show the admin level
        RAISE NOTICE 'Admin level: %', (SELECT admin_level FROM admin_profiles WHERE user_id = signup_user_id);
        
        RAISE NOTICE '✅ Manual Level 2 admin creation completed!';
        RAISE NOTICE 'The user should now be able to login with full Level 2 admin functionality.';
    END IF;
END $$;
