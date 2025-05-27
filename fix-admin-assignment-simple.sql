-- SIMPLE FIX: Update schools.admin_user_id for existing school admins
-- Run this AFTER running the diagnostic script above

-- This will fix all school admins who signed up but weren't properly assigned
UPDATE schools 
SET admin_user_id = auth_users.id,
    updated_at = CURRENT_TIMESTAMP
FROM auth.users auth_users
WHERE schools.id = (auth_users.raw_user_meta_data ->> 'school_id')::uuid
  AND auth_users.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
  AND schools.admin_user_id IS NULL;

-- Check the result
SELECT 'FIXED - Schools now showing admin assignments:' as result;
SELECT 
    s.id as school_id,
    s.name as school_name,
    u.email as admin_email,
    CASE 
        WHEN s.admin_user_id IS NOT NULL THEN 'Admin Assigned ✅'
        ELSE 'No Admin ❌'
    END as status
FROM schools s
LEFT JOIN auth.users u ON u.id = s.admin_user_id
ORDER BY s.name;

-- Ensure the trigger exists for future signups
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
      AND admin_user_id IS NULL;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_school
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_school_admin_assignment();

SELECT 'School admin assignment fix completed! 🎉' as status;