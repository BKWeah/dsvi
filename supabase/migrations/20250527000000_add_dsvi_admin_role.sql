-- Add DSVI_ADMIN and SCHOOL_ADMIN roles to auth.users.role enum

-- Create a new enum type with all existing and new roles
CREATE TYPE public.user_role_enum AS ENUM ('authenticated', 'anon', 'DSVI_ADMIN', 'SCHOOL_ADMIN');

-- Alter the auth.users.role column to use the new enum type
-- First, set a default value for existing rows if they have a role not in the new enum
-- This step might not be strictly necessary if all existing roles are 'authenticated' or 'anon'
-- but it's good practice for safety.
ALTER TABLE auth.users
ALTER COLUMN role TYPE public.user_role_enum
USING role::text::public.user_role_enum;

-- Optional: Add RLS policies if needed for these new roles, but this is outside the scope of the current task.
-- The application's ProtectedRoute already handles client-side role checks.

SELECT 'DSVI_ADMIN and SCHOOL_ADMIN roles added successfully!' as status;
