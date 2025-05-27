-- COMPLETE SCHEMA SETUP FOR CLOUD DATABASE
-- Run this AFTER running the reset script

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schools table
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  contact_info JSONB,
  theme_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT schools_slug_unique UNIQUE (slug)
);

-- Create pages table
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  page_type TEXT, -- keeping for backward compatibility
  page_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  meta_description TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pages_school_page_unique UNIQUE (school_id, page_slug)
);

-- Create school_requests table
CREATE TABLE school_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  school_type TEXT,
  student_count TEXT,
  website TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_pages_school_page ON pages(school_id, page_slug);
CREATE INDEX idx_pages_school_id ON pages(school_id);
CREATE INDEX idx_school_requests_status ON school_requests(status);
CREATE INDEX idx_school_requests_created_at ON school_requests(created_at);
CREATE INDEX idx_school_requests_email ON school_requests(contact_email);

-- Set up Row Level Security (RLS)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

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

-- School requests policies
CREATE POLICY "Anyone can submit school requests" ON school_requests
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "DSVI admins can view all requests" ON school_requests
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );

CREATE POLICY "DSVI admins can update requests" ON school_requests
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );

-- Create storage bucket for public files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true);

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

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_requests_updated_at 
  BEFORE UPDATE ON school_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create notification function for new requests
CREATE OR REPLACE FUNCTION notify_new_school_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_school_request', json_build_object(
    'id', NEW.id,
    'school_name', NEW.school_name,
    'contact_email', NEW.contact_email
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER school_request_notification
  AFTER INSERT ON school_requests
  FOR EACH ROW EXECUTE FUNCTION notify_new_school_request();

-- Final confirmation
SELECT 'Complete database schema setup completed successfully!' as status;
