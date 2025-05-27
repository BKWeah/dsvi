-- SCHOOL ADMIN ASSIGNMENT FIX
-- Run this in your Supabase SQL Editor to fix the admin assignment issue

-- Step 1: Check current state
SELECT 'Current state of schools and admins:' as info;
SELECT 
    s.id,
    s.name,
    s.admin_user_id,
    CASE 
        WHEN s.admin_user_id IS NOT NULL THEN 'Has Admin'
        ELSE 'No Admin'
    END as admin_status
FROM schools s
ORDER BY s.name;

-- Step 2: Find users who should be school admins but aren't assigned
SELECT 'Users who should be school admins:' as info;
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data ->> 'role' as role,
    u.raw_user_meta_data ->> 'school_id' as intended_school_id,
    s.name as school_name,
    s.admin_user_id as current_admin_id
FROM auth.users u
LEFT JOIN schools s ON s.id = (u.raw_user_meta_data ->> 'school_id')::uuid
WHERE u.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
  AND u.raw_user_meta_data ->> 'school_id' IS NOT NULL;

-- Step 3: Fix the assignments
SELECT 'Fixing admin assignments...' as info;

-- Update schools to assign their admins (only if no admin is currently assigned)
UPDATE schools 
SET admin_user_id = subquery.user_id,
    updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT 
        u.id as user_id,
        (u.raw_user_meta_data ->> 'school_id')::uuid as school_id
    FROM auth.users u
    WHERE u.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
      AND u.raw_user_meta_data ->> 'school_id' IS NOT NULL
) as subquery
WHERE schools.id = subquery.school_id
  AND schools.admin_user_id IS NULL;
-- Step 4: Re-create the trigger to prevent future issues
SELECT 'Setting up trigger for future signups...' as info;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;

-- Re-create the function
CREATE OR REPLACE FUNCTION handle_school_admin_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is a school admin with a school_id in metadata
  IF (NEW.raw_user_meta_data ->> 'role') = 'SCHOOL_ADMIN' 
     AND (NEW.raw_user_meta_data ->> 'school_id') IS NOT NULL THEN
    
    -- Update the school record to link this admin
    UPDATE schools 
    SET admin_user_id = NEW.id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (NEW.raw_user_meta_data ->> 'school_id')::uuid
      AND admin_user_id IS NULL; -- Only if no admin is currently assigned
      
    -- Log the assignment for debugging
    RAISE NOTICE 'Assigned user % as admin for school %', NEW.id, (NEW.raw_user_meta_data ->> 'school_id');
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_assign_school
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_school_admin_assignment();

-- Step 5: Verify the fix
SELECT 'Verification - Updated schools:' as info;
SELECT 
    s.id,
    s.name,
    s.admin_user_id,
    u.email as admin_email,
    CASE 
        WHEN s.admin_user_id IS NOT NULL THEN 'Has Admin ✅'
        ELSE 'No Admin ❌'
    END as admin_status
FROM schools s
LEFT JOIN auth.users u ON u.id = s.admin_user_id
ORDER BY s.name;

SELECT 'School admin assignment fix completed!' as status;