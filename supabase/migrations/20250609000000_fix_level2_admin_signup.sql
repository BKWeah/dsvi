-- Migration: Fix Level 2 Admin Signup Process (CORRECTED v2)
-- Date: 2025-06-09
-- Purpose: Fix user_profiles table structure and add missing functions

-- ===============================================================================
-- 1. FIX EXISTING USER_PROFILES TABLE STRUCTURE
-- ===============================================================================

-- Add the missing user_id column that references auth.users
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique constraint on user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_profiles' 
        AND constraint_name = 'user_profiles_user_id_key'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE(user_id);
    END IF;
END $$;

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "user_profiles_own_read" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_dsvi_admin_all" ON user_profiles;

-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "user_profiles_own_read" ON user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_profiles_dsvi_admin_all" ON user_profiles
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);
-- ===============================================================================
-- 2. UPDATE upsert_user_profile FUNCTION FOR EXISTING TABLE
-- ===============================================================================
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update user profile in existing table structure
    INSERT INTO user_profiles (user_id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, p_role, p_name, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        updated_at = NOW()
    WHERE user_profiles.user_id = EXCLUDED.user_id;
    
    -- Also handle potential conflicts on email if there are existing records without user_id
    UPDATE user_profiles 
    SET user_id = p_user_id, updated_at = NOW()
    WHERE email = p_email AND user_id IS NULL;
        
    RAISE NOTICE 'Profile synced for user: %, role: %', p_email, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

SELECT 'Fixed user_profiles table structure completed!' as status;