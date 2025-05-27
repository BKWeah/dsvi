-- MANUAL ADMIN ASSIGNMENT FUNCTION
-- Run this in Supabase SQL Editor to create a function for manual assignment

-- Create a function to fix all unassigned school admins
CREATE OR REPLACE FUNCTION fix_all_unassigned_school_admins()
RETURNS text AS $$
DECLARE
    result_text text := '';
    user_record record;
    assignment_count integer := 0;
BEGIN
    -- Loop through all school admin users who have school_id in metadata
    FOR user_record IN 
        SELECT 
            u.id as user_id,
            u.email,
            (u.raw_user_meta_data ->> 'school_id')::uuid as school_id,
            s.name as school_name,
            s.admin_user_id as current_admin
        FROM auth.users u
        LEFT JOIN schools s ON s.id = (u.raw_user_meta_data ->> 'school_id')::uuid
        WHERE u.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
          AND u.raw_user_meta_data ->> 'school_id' IS NOT NULL
          AND s.id IS NOT NULL
          AND s.admin_user_id IS NULL
    LOOP
        -- Assign this user as admin to their school
        UPDATE schools 
        SET admin_user_id = user_record.user_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = user_record.school_id;
        
        assignment_count := assignment_count + 1;
        result_text := result_text || 'Assigned ' || user_record.email || ' to ' || user_record.school_name || '; ';
    END LOOP;
    
    IF assignment_count = 0 THEN
        RETURN 'No unassigned school admins found.';
    ELSE
        RETURN 'Fixed ' || assignment_count || ' assignments: ' || result_text;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT fix_all_unassigned_school_admins() as result;