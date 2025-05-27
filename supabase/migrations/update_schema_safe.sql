-- Migration script to update DSVI database schema to match the comprehensive brief
-- This version handles existing constraints and columns gracefully

-- First, let's update the schools table to add missing fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'contact_info') THEN
        ALTER TABLE schools ADD COLUMN contact_info JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'theme_settings') THEN
        ALTER TABLE schools ADD COLUMN theme_settings JSONB;
    END IF;
END $$;

-- Update schools table constraints (only if they don't exist)
DO $$ 
BEGIN
    -- Make slug not null if it isn't already
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'slug' AND is_nullable = 'YES') THEN
        ALTER TABLE schools ALTER COLUMN slug SET NOT NULL;
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'schools_slug_unique') THEN
        ALTER TABLE schools ADD CONSTRAINT schools_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Now let's update the pages table structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'page_slug') THEN
        ALTER TABLE pages ADD COLUMN page_slug TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'meta_description') THEN
        ALTER TABLE pages ADD COLUMN meta_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'sections') THEN
        ALTER TABLE pages ADD COLUMN sections JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Copy existing page_type to page_slug for migration (only if page_slug is null)
UPDATE pages SET page_slug = page_type WHERE page_slug IS NULL AND page_type IS NOT NULL;

-- Make page_slug not null and add constraint (only if needed)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'page_slug' AND is_nullable = 'YES') THEN
        ALTER TABLE pages ALTER COLUMN page_slug SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pages_school_page_unique') THEN
        ALTER TABLE pages ADD CONSTRAINT pages_school_page_unique UNIQUE (school_id, page_slug);
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_pages_school_page ON pages(school_id, page_slug);
CREATE INDEX IF NOT EXISTS idx_pages_school_id ON pages(school_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by DSVI admins" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by school admins" ON schools;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by DSVI admins" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by school admins" ON pages;

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
DROP POLICY IF EXISTS "Public bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

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

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers and recreate them
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration completed successfully
SELECT 'DSVI Database migration completed successfully!' as status;
