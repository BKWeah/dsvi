-- Migration script to update DSVI database schema to match the comprehensive brief
-- Run this in Supabase SQL Editor

-- First, let's update the schools table to add missing fields
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS contact_info JSONB,
ADD COLUMN IF NOT EXISTS theme_settings JSONB;

-- Update schools table to have proper constraints
ALTER TABLE schools 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT schools_slug_unique UNIQUE (slug);

-- Now let's update the pages table structure
-- First, add the new columns
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS page_slug TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;

-- Copy existing page_type to page_slug for migration
UPDATE pages SET page_slug = page_type WHERE page_slug IS NULL;

-- Make page_slug not null and add constraint
ALTER TABLE pages 
ALTER COLUMN page_slug SET NOT NULL,
ADD CONSTRAINT pages_school_page_unique UNIQUE (school_id, page_slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_pages_school_page ON pages(school_id, page_slug);
CREATE INDEX IF NOT EXISTS idx_pages_school_id ON pages(school_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Schools are viewable by everyone" ON schools
  FOR SELECT USING (true);

CREATE POLICY "Schools are manageable by DSVI admins" ON schools
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );

CREATE POLICY "Schools are manageable by school admins" ON schools
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'SCHOOL_ADMIN'
    AND admin_user_id = auth.uid()
  );

-- Pages policies
CREATE POLICY "Pages are viewable by everyone" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Pages are manageable by DSVI admins" ON pages
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );

CREATE POLICY "Pages are manageable by school admins" ON pages
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'SCHOOL_ADMIN'
    AND school_id IN (
      SELECT id FROM schools WHERE admin_user_id = auth.uid()
    )
  );

-- Create storage bucket for public files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public bucket
CREATE POLICY "Public bucket is viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'public' 
    AND auth.role() = 'authenticated'
  );

-- Add updated_at trigger for schools table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
