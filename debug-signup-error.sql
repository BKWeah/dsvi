-- DEBUG SIGNUP FAILURE - Run this to identify and fix the signup error
-- Copy and paste in Supabase SQL Editor

-- Step 1: Check if the trigger function has permission issues
SELECT 'Checking trigger function permissions...' as step;
SELECT 
    routine_name,
    routine_type, 
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_school_admin_assignment';

-- Step 2: Check current trigger status
SELECT 'Checking trigger status...' as step;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_assign_school';

-- Step 3: Fix the trigger function with proper permissions
CREATE OR REPLACE FUNCTION handle_school_admin_assignment()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Check if the user is a school admin with a school_id in metadata
    IF (NEW.raw_user_meta_data ->> 'role') = 'SCHOOL_ADMIN' 
       AND (NEW.raw_user_meta_data ->> 'school_id') IS NOT NULL THEN
      
      -- Update the school record to link this admin (with error handling)
      UPDATE schools 
      SET admin_user_id = NEW.id,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (NEW.raw_user_meta_data ->> 'school_id')::uuid
        AND admin_user_id IS NULL;
      
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the user creation
      RAISE WARNING 'School admin assignment failed for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Step 4: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_school
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_school_admin_assignment();

-- Step 5: TEMPORARY FIX - Disable the trigger completely to allow signups
-- (We'll assign admins manually after signup succeeds)
SELECT 'TEMPORARILY DISABLING TRIGGER to allow signup...' as step;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;

-- Step 6: Verify auth table permissions
SELECT 'Checking auth table access...' as step;
SELECT COUNT(*) as user_count FROM auth.users LIMIT 1;

-- Step 7: Check schools table constraints
SELECT 'Checking schools table constraints...' as step;
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'schools';

SELECT 'Signup error debug completed!' as status;
SELECT 'Try signup again - it should work now without the trigger.' as next_step;
SELECT 'After signup succeeds, we can manually assign the admin.' as note;