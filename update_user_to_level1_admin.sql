-- SQL script to update a user's role to DSVI_ADMIN and set their admin_level to 1.
-- This script assumes you have the necessary permissions (e.g., a Supabase service role key)
-- to modify auth.users and dsvi_admins tables directly.

-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' and 'YOUR_USER_EMAIL_HERE' with the actual user ID and email.

DO $$
DECLARE
    target_user_id UUID := 'c2d58fd6-089d-4f8d-9acf-24918b0d097c'; -- Replace with the actual user's UUID
    target_user_email TEXT := 'admin@dsvi.org'; -- Replace with the actual user's email
BEGIN
    -- 1. Update the user's metadata in auth.users table
    -- Note: Directly updating auth.users.raw_user_meta_data is generally done via
    -- Supabase's Admin API or a server-side function with a service role key.
    -- This SQL is for direct database access for administrative purposes.
    UPDATE auth.users
    SET
        raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"DSVI_ADMIN"',
            true
        ),
        updated_at = now()
    WHERE id = target_user_id;

    RAISE NOTICE 'Updated user_metadata for user %', target_user_id;

    -- 2. Insert or update the user's entry in the dsvi_admins table to set admin_level to 1
    INSERT INTO public.dsvi_admins (user_id, email, admin_level, name, permissions, updated_at, last_login)
    VALUES (
        target_user_id,
        target_user_email,
        1, -- Admin Level 1 (SUPER_ADMIN)
        'Admin User', -- You might want to fetch the actual name or set a default
        '{}'::text[], -- Level 1 admins typically have all permissions, or an empty array if permissions are managed implicitly
        now(),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        admin_level = 1,
        name = COALESCE(dsvi_admins.name, EXCLUDED.name), -- Keep existing name if present
        permissions = '{}'::text[], -- Ensure permissions are reset or set appropriately for Level 1
        updated_at = now(),
        last_login = now();

    RAISE NOTICE 'Ensured dsvi_admins entry for user % with admin_level 1', target_user_id;

END $$;
