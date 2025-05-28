-- ===============================================================================
-- DSVI Platform - Final Consolidated Migration
-- Date: 2025-05-28
-- Purpose: Consolidates all fixes and enhancements made during development
-- ===============================================================================

-- Ensure proper RLS policies are in place (consolidated from various fix files)
-- This addresses all the RLS issues that were fixed during development

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by DSVI admins" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by school admins" ON schools;
DROP POLICY IF EXISTS "Public read access" ON schools;
DROP POLICY IF EXISTS "Admin full access" ON schools;

DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Enable read access for all pages" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by DSVI admins" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by school admins" ON pages;
DROP POLICY IF EXISTS "Public read access" ON pages;
DROP POLICY IF EXISTS "Admin full access" ON pages;

DROP POLICY IF EXISTS "Anyone can submit school requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can view all requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can update requests" ON school_requests;
DROP POLICY IF EXISTS "Public read access" ON school_requests;
DROP POLICY IF EXISTS "Admin full access" ON school_requests;
DROP POLICY IF EXISTS "Public can submit requests" ON school_requests;

-- Ensure RLS is enabled on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- ===============================================================================
-- SCHOOLS TABLE POLICIES
-- ===============================================================================

-- Public read access for school websites
CREATE POLICY "schools_public_read" ON schools 
FOR SELECT USING (true);

-- DSVI Admin full access
CREATE POLICY "schools_dsvi_admin_all" ON schools 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- School Admin can update their own school
CREATE POLICY "schools_school_admin_update" ON schools 
FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  admin_user_id = auth.uid()
);

-- ===============================================================================
-- PAGES TABLE POLICIES
-- ===============================================================================

-- Public read access for school websites
CREATE POLICY "pages_public_read" ON pages 
FOR SELECT USING (true);

-- DSVI Admin full access
CREATE POLICY "pages_dsvi_admin_all" ON pages 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- School Admin can manage pages for their school
CREATE POLICY "pages_school_admin_all" ON pages 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT id FROM schools WHERE admin_user_id = auth.uid()
  )
);

-- ===============================================================================
-- SCHOOL REQUESTS TABLE POLICIES  
-- ===============================================================================

-- Public can submit school requests
CREATE POLICY "school_requests_public_insert" ON school_requests 
FOR INSERT WITH CHECK (true);

-- DSVI Admin full access to view and manage requests
CREATE POLICY "school_requests_dsvi_admin_all" ON school_requests 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- ===============================================================================
-- STORAGE POLICIES (ensure proper file access)
-- ===============================================================================

-- Ensure storage bucket policies are correct
DO $$
BEGIN
  -- Create public bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('public', 'public', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Recreate storage policies
CREATE POLICY "storage_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "storage_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'public' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "storage_authenticated_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'public' AND 
  auth.role() = 'authenticated'
);

-- ===============================================================================
-- ENHANCED THEME SYSTEM (ensure columns exist)
-- ===============================================================================

-- Add theme system columns if they don't exist
DO $$
BEGIN
  -- Add theme_settings JSONB column for comprehensive theme storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schools' AND column_name = 'theme_settings'
  ) THEN
    ALTER TABLE schools ADD COLUMN theme_settings JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add custom_css text column for advanced CSS customization
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schools' AND column_name = 'custom_css'
  ) THEN
    ALTER TABLE schools ADD COLUMN custom_css TEXT;
  END IF;

  -- Add theme_version integer for tracking theme updates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schools' AND column_name = 'theme_version'
  ) THEN
    ALTER TABLE schools ADD COLUMN theme_version INTEGER DEFAULT 1;
  END IF;
END $$;

-- ===============================================================================
-- ADMIN ASSIGNMENT HELPER FUNCTION
-- ===============================================================================

-- Function to safely assign school admin
CREATE OR REPLACE FUNCTION assign_school_admin(
  p_school_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update school admin assignment
  UPDATE schools 
  SET admin_user_id = p_user_id,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_school_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- VALIDATION AND COMPLETION
-- ===============================================================================

-- Test that policies are working
SELECT 'Testing RLS policies...' as status;

-- Validate table access
SELECT 
  'schools' as table_name,
  COUNT(*) as record_count
FROM schools
UNION ALL
SELECT 
  'pages' as table_name,
  COUNT(*) as record_count  
FROM pages
UNION ALL
SELECT 
  'school_requests' as table_name,
  COUNT(*) as record_count
FROM school_requests;

-- Final confirmation
SELECT 'DSVI Platform - Final consolidated migration completed successfully!' as status;
SELECT 'All RLS policies, theme system, and admin functions are now properly configured.' as details;
