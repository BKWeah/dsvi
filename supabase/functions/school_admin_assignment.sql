-- Database function to automatically assign school admins to their schools
-- Run this in Supabase SQL Editor

-- Function to update school admin assignment when user signs up
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
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_assign_school ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_school
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_school_admin_assignment();

-- Also create a function to check user's assigned school
CREATE OR REPLACE FUNCTION get_user_school(user_id uuid)
RETURNS TABLE(school_id uuid, school_name text, school_slug text) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.slug
  FROM schools s
  WHERE s.admin_user_id = user_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'School admin auto-assignment system created successfully!' as status;
