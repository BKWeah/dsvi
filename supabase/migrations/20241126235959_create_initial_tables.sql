-- Comprehensive initial migration for DSVI CMS
-- Creates all tables with complete schema including theme system

-- Create schools table with all necessary columns
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  theme_settings JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT,
  theme_version INTEGER DEFAULT 1,
  contact_info JSONB DEFAULT '{}'::jsonb
);

-- Create pages table with complete schema
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  page_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  page_type TEXT -- For backward compatibility
);

-- Add unique constraint for school_id + page_slug combination
ALTER TABLE pages ADD CONSTRAINT pages_school_page_unique 
UNIQUE (school_id, page_slug);

-- Create school_requests table for registration requests
CREATE TABLE IF NOT EXISTS school_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  school_name TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create storage bucket for public files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true) 
ON CONFLICT (id) DO NOTHING;
-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_requests_updated_at ON school_requests;
CREATE TRIGGER update_school_requests_updated_at BEFORE UPDATE ON school_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_admin_user ON schools(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_pages_school_id ON pages(school_id);
CREATE INDEX IF NOT EXISTS idx_pages_school_page ON pages(school_id, page_slug);
CREATE INDEX IF NOT EXISTS idx_school_requests_status ON school_requests(status);
CREATE INDEX IF NOT EXISTS idx_school_requests_email ON school_requests(admin_email);
CREATE INDEX IF NOT EXISTS idx_schools_theme_settings ON schools USING GIN (theme_settings);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- Storage policies for public bucket
CREATE POLICY "Public bucket is viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'public' AND auth.role() = 'authenticated');

SELECT 'Comprehensive initial schema created successfully!' as status;