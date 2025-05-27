-- STEP 1: Drop all existing tables and buckets (BE CAREFUL - THIS IS DESTRUCTIVE!)
-- Run this in your Supabase Cloud SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by DSVI admins" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by school admins" ON schools;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by DSVI admins" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by school admins" ON pages;
DROP POLICY IF EXISTS "Anyone can submit school requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can view all requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can update requests" ON school_requests;

-- Drop storage policies
DROP POLICY IF EXISTS "Public bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Drop triggers
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
DROP TRIGGER IF EXISTS update_school_requests_updated_at ON school_requests;
DROP TRIGGER IF EXISTS school_request_notification ON school_requests;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS notify_new_school_request() CASCADE;

-- Drop tables (in correct order to handle foreign key constraints)
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS school_requests CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Delete storage buckets
DELETE FROM storage.buckets WHERE id = 'public';

-- Confirmation
SELECT 'Cloud database cleared successfully! Ready for fresh migrations.' as status;
