-- Migration Helper: Create Level 1 Admin Profiles for Existing DSVI Admins
-- This SQL script can be run to manually upgrade existing DSVI admins to Level 1
-- Date: 2025-06-04

-- Function to manually create Level 1 profiles for existing DSVI admins who don't have admin profiles
CREATE OR REPLACE FUNCTION migrate_existing_dsvi_admins()
RETURNS TABLE(user_id UUID, email TEXT, migrated BOOLEAN) AS $$
DECLARE
    admin_record RECORD;
    profile_id UUID;
BEGIN
    -- Find all DSVI admin users who don't have admin profiles
    FOR admin_record IN 
        SELECT au.id as user_id, au.email
        FROM auth.users au
        WHERE au.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.user_id = au.id
        )
    LOOP
        BEGIN
            -- Create Level 1 admin profile
            INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, updated_at)
            VALUES (
                admin_record.user_id, 
                1, 
                admin_record.user_id,
                'Migrated existing DSVI admin to Level 1 on ' || NOW()::DATE,
                NOW(),
                NOW()
            )
            RETURNING id INTO profile_id;
            
            -- Return success
            user_id := admin_record.user_id;
            email := admin_record.email;
            migrated := TRUE;
            RETURN NEXT;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return failure
            user_id := admin_record.user_id;
            email := admin_record.email;
            migrated := FALSE;
            RETURN NEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to check which DSVI admins need migration
CREATE OR REPLACE FUNCTION check_dsvi_admins_needing_migration()
RETURNS TABLE(user_id UUID, email TEXT, has_admin_profile BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as user_id,
        au.email,
        EXISTS(SELECT 1 FROM admin_profiles ap WHERE ap.user_id = au.id) as has_admin_profile
    FROM auth.users au
    WHERE au.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
    ORDER BY au.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migrate_existing_dsvi_admins() IS 'Migrates existing DSVI admins without admin profiles to Level 1';
COMMENT ON FUNCTION check_dsvi_admins_needing_migration() IS 'Lists all DSVI admins and their admin profile status';