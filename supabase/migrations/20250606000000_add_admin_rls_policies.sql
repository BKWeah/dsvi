-- Migration: Add RLS Policies for Admin Tables
-- Date: 2025-06-06
-- Purpose: Ensure authenticated users can read their own admin profiles, permissions, and assignments.

-- Enable RLS on admin_profiles table
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to select their own admin_profile
CREATE POLICY "Authenticated users can view their own admin profile"
ON admin_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on admin_permissions table
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to select their own admin_permissions
CREATE POLICY "Authenticated users can view their own admin permissions"
ON admin_permissions FOR SELECT
TO authenticated
USING (auth.uid() = admin_user_id);

-- Enable RLS on admin_assignments table
ALTER TABLE admin_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to select their own admin_assignments
CREATE POLICY "Authenticated users can view their own admin assignments"
ON admin_assignments FOR SELECT
TO authenticated
USING (auth.uid() = admin_user_id);
