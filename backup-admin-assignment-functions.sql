-- BACKUP SOLUTION: Alternative trigger using a different approach
-- If the auth.users trigger doesn't work, this creates a function you can call manually

-- Create a function to manually assign school admins
CREATE OR REPLACE FUNCTION assign_school_admin_by_email(user_email text)
RETURNS text AS $$
DECLARE
    user_record auth.users;
    school_id_from_metadata text;
    result_message text;
BEGIN
    -- Find the user by email
    SELECT * INTO user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Get school_id from metadata
    school_id_from_metadata := user_record.raw_user_meta_data ->> 'school_id';
    
    IF school_id_from_metadata IS NULL THEN
        RETURN 'No school_id found in user metadata for: ' || user_email;
    END IF;
    
    -- Update the school
    UPDATE schools 
    SET admin_user_id = user_record.id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = school_id_from_metadata::uuid
      AND admin_user_id IS NULL;
    
    IF FOUND THEN
        RETURN 'Successfully assigned ' || user_email || ' as admin for school ' || school_id_from_metadata;
    ELSE
        RETURN 'School not found or already has an admin for school_id: ' || school_id_from_metadata;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check all unassigned school admins
CREATE OR REPLACE FUNCTION fix_all_unassigned_school_admins()
RETURNS text AS $$
DECLARE
    admin_record auth.users;
    fixed_count integer := 0;
    total_count integer := 0;
BEGIN
    -- Loop through all school admin users
    FOR admin_record IN 
        SELECT * FROM auth.users 
        WHERE raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
          AND raw_user_meta_data ->> 'school_id' IS NOT NULL
    LOOP
        total_count := total_count + 1;
        
        -- Try to assign this admin to their school
        UPDATE schools 
        SET admin_user_id = admin_record.id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = (admin_record.raw_user_meta_data ->> 'school_id')::uuid
          AND admin_user_id IS NULL;
        
        IF FOUND THEN
            fixed_count := fixed_count + 1;
        END IF;
    END LOOP;
    
    RETURN 'Fixed ' || fixed_count || ' out of ' || total_count || ' school admin assignments';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;