-- EMERGENCY FIX: Ensure user_profiles table works correctly
-- Run this to fix the table structure

-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Add user_id column if missing (this might have failed in migration)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Update the upsert function to handle the real table structure
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if user_id column exists in user_profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'user_id'
    ) THEN
        -- Use user_id column if it exists
        INSERT INTO user_profiles (user_id, email, role, name, created_at, updated_at)
        VALUES (p_user_id, p_email, p_role, p_name, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            name = EXCLUDED.name,
            updated_at = NOW();
    ELSE
        -- Fallback: use email as primary key if user_id doesn't exist
        INSERT INTO user_profiles (email, role, name, created_at, updated_at)
        VALUES (p_email, p_role, p_name, NOW(), NOW())
        ON CONFLICT (email) 
        DO UPDATE SET 
            role = EXCLUDED.role,
            name = EXCLUDED.name,
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE 'Profile synced for user: %, role: %', p_email, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT upsert_user_profile(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'test@example.com',
    'DSVI_ADMIN', 
    'Test User'
);

-- Check what was created
SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 3;
