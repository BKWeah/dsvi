-- NUCLEAR OPTION: Recreate tables without RLS (use only if forced disable fails)
-- ⚠️ This will delete all existing data in the tables!

-- Backup existing data first (optional)
CREATE TABLE schools_backup AS SELECT * FROM schools;
CREATE TABLE pages_backup AS SELECT * FROM pages;  
CREATE TABLE school_requests_backup AS SELECT * FROM school_requests;

-- Drop existing tables
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS school_requests CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Recreate tables WITHOUT enabling RLS
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  contact_info JSONB,
  theme_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  page_type TEXT,
  page_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  meta_description TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(school_id, page_slug)
);

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

-- Create indexes
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_pages_school_page ON pages(school_id, page_slug);
CREATE INDEX idx_school_requests_status ON school_requests(status);

-- DO NOT ENABLE RLS - leave tables completely open

SELECT '✅ Tables recreated without RLS - should work now!' as status;
