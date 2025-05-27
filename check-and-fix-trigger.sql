-- CHECK AND FIX TRIGGER FOR AUTOMATIC ADMIN ASSIGNMENT
-- Run this in Supabase SQL Editor to ensure future signups work automatically

-- Step 1: Check if the trigger currently exists
SELECT 'Checking existing triggers...' as step;
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%school%' OR trigger_name LIKE '%admin%';

-- Step 2: Check if the function exists
SELECT 'Checking trigger function...' as step;
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%school%admin%';

-- Step 3: Test current state of auth.users table access
SELECT 'Testing auth.users access...' as step;
SELECT COUNT(*) as total_users FROM auth.users;

-- Step 4: Recreate the trigger function (improved version)
CREATE OR REPLACE FUNCTION handle_school_admin_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger firing for debugging
  RAISE NOTICE 'Trigger fired for user: %, role: %, school_id: %', 
    NEW.id, 
    NEW.raw_user_meta_data ->> 'role',
    NEW.raw_user_meta_data ->> 'school_id';
  
  -- Check if the user is a school admin with a school_id in metadata
  IF (NEW.raw_user_meta_data ->> 'role') = 'SCHOOL_ADMIN' 
     AND (NEW.raw_user_meta_data ->> 'school_id') IS NOT NULL THEN
    
    -- Update the school record to link this admin
    UPDATE schools 
    SET admin_user_id = NEW.id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (NEW.raw_user_meta_data ->> 'school_id')::uuid
      AND admin_user_id IS NULL; -- Only if no admin is currently assigned
      
    -- Log successful assignment
    RAISE NOTICE 'Successfully assigned user % as admin for school %', 
      NEW.id, (NEW.raw_user_meta_data ->> 'school_id');
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Step 5: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_school
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_school_admin_assignment();

-- Step 6: Verify trigger is active
SELECT 'Verifying trigger installation...' as step;
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_assign_school';

-- Step 7: Test with a hypothetical user (this won't actually create a user)
SELECT 'Trigger should now work for future signups!' as status;

-- IMPORTANT: To test if the trigger works:
-- 1. Create a new invite link for a school
-- 2. Have someone sign up using that link
-- 3. Check if schools.admin_user_id gets updated automatically
-- 4. If not, check the Supabase logs for any NOTICE messages from the trigger

SELECT 'Setup complete! Future school admin signups should automatically assign admin_user_id.' as final_status;