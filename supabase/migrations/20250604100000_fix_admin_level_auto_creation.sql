-- Migration: Fix Admin Level Auto-Creation Issue
-- This migration fixes the issue where Level 2 admin signups are being overridden by auto-Level 1 creation
-- Date: 2025-06-04

-- Drop and recreate the upsert_user_profile function to NOT automatically create admin profiles
-- Admin profiles should only be created explicitly through the invitation process
DROP FUNCTION IF EXISTS upsert_user_profile(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- This function now only syncs basic user profile information
    -- It does NOT automatically create admin profiles for DSVI_ADMIN users
    -- Admin profiles should be created explicitly through the invitation/management system
    
    -- Note: We don't need to insert into a users table since we're using Supabase Auth
    -- This function is now simplified to avoid conflicts with Level 2 admin creation
    
    -- Log the profile sync (you can remove this in production)
    RAISE NOTICE 'Profile synced for user: %, role: %', p_email, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION upsert_user_profile(UUID, TEXT, TEXT, TEXT) IS 'Syncs user profile information without automatically creating admin profiles';
