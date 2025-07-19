-- ===============================================================================
-- GyaWe School Directory Platform - Database Schema
-- Date: 2025-07-05
-- Purpose: Create tables for the school directory platform
-- ===============================================================================

-- Create directory_visitors table for visitor signup data
CREATE TABLE IF NOT EXISTS directory_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  first_name TEXT NOT NULL,
  email_or_whatsapp TEXT NOT NULL,
  city TEXT,
  county TEXT,
  education_level TEXT,
  profession TEXT,
  consent_given BOOLEAN DEFAULT true,
  session_id TEXT -- Track session to avoid showing modal multiple times
);

-- Create directory_manual_schools table for non-DSVI school submissions
CREATE TABLE IF NOT EXISTS directory_manual_schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  school_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  school_type TEXT CHECK (school_type IN ('public', 'private')),
  year_established INTEGER,
  location TEXT, -- e.g., "Harper, Maryland County"
  website_url TEXT,
  permit_url TEXT, -- URL to permit/accreditation certificate
  contact_info JSONB DEFAULT '{}'::jsonb,
  categories TEXT[] DEFAULT '{}', -- e.g., ['elementary', 'high_school']
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create directory_ads table for promotional campaigns
CREATE TABLE IF NOT EXISTS directory_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL, -- Can reference either schools.id or directory_manual_schools.id
  school_type TEXT NOT NULL CHECK (school_type IN ('dsvi', 'manual')), -- Track which table school_id references
  ad_content TEXT NOT NULL, -- Text content for text ads
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'text', 'video')),
  ad_file_url TEXT, -- For banner images or video files
  target_audience JSONB DEFAULT '{}'::jsonb, -- Store targeting criteria
  reach_count INTEGER NOT NULL, -- Number of targeted viewers
  duration_days INTEGER NOT NULL, -- Campaign duration
  pricing DECIMAL(10,2) NOT NULL, -- Campaign cost
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected')),
  impressions INTEGER DEFAULT 0, -- Track actual views
  clicks INTEGER DEFAULT 0, -- Track clicks (future feature)
  expires_at TIMESTAMP WITH TIME ZONE, -- When campaign ends
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_reference TEXT, -- Payment transaction reference
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create directory_ad_targeting table for detailed targeting criteria
CREATE TABLE IF NOT EXISTS directory_ad_targeting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES directory_ads(id) ON DELETE CASCADE NOT NULL,
  county TEXT,
  city TEXT,
  education_levels TEXT[], -- e.g., ['undergraduate', 'graduate']
  professions TEXT[], -- e.g., ['teacher', 'parent']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_directory_visitors_updated_at ON directory_visitors;
CREATE TRIGGER update_directory_visitors_updated_at BEFORE UPDATE ON directory_visitors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_directory_manual_schools_updated_at ON directory_manual_schools;
CREATE TRIGGER update_directory_manual_schools_updated_at BEFORE UPDATE ON directory_manual_schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_directory_ads_updated_at ON directory_ads;
CREATE TRIGGER update_directory_ads_updated_at BEFORE UPDATE ON directory_ads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_directory_visitors_email ON directory_visitors(email_or_whatsapp);
CREATE INDEX IF NOT EXISTS idx_directory_visitors_county ON directory_visitors(county);
CREATE INDEX IF NOT EXISTS idx_directory_visitors_city ON directory_visitors(city);
CREATE INDEX IF NOT EXISTS idx_directory_visitors_session ON directory_visitors(session_id);

CREATE INDEX IF NOT EXISTS idx_directory_manual_schools_status ON directory_manual_schools(status);
CREATE INDEX IF NOT EXISTS idx_directory_manual_schools_type ON directory_manual_schools(school_type);
CREATE INDEX IF NOT EXISTS idx_directory_manual_schools_location ON directory_manual_schools(location);

CREATE INDEX IF NOT EXISTS idx_directory_ads_school ON directory_ads(school_id, school_type);
CREATE INDEX IF NOT EXISTS idx_directory_ads_status ON directory_ads(status);
CREATE INDEX IF NOT EXISTS idx_directory_ads_expires ON directory_ads(expires_at);
CREATE INDEX IF NOT EXISTS idx_directory_ads_targeting ON directory_ads USING GIN (target_audience);

CREATE INDEX IF NOT EXISTS idx_directory_ad_targeting_ad ON directory_ad_targeting(ad_id);
CREATE INDEX IF NOT EXISTS idx_directory_ad_targeting_location ON directory_ad_targeting(county, city);

-- Enable Row Level Security
ALTER TABLE directory_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_manual_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_ad_targeting ENABLE ROW LEVEL SECURITY;

-- ===============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ===============================================================================

-- Directory Visitors Policies
CREATE POLICY "directory_visitors_public_insert" ON directory_visitors 
FOR INSERT WITH CHECK (true); -- Anyone can submit visitor data

CREATE POLICY "directory_visitors_admin_read" ON directory_visitors 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
); -- Only DSVI admins can view visitor data

-- Directory Manual Schools Policies
CREATE POLICY "directory_manual_schools_public_insert" ON directory_manual_schools 
FOR INSERT WITH CHECK (true); -- Anyone can submit school registration

CREATE POLICY "directory_manual_schools_public_read_approved" ON directory_manual_schools 
FOR SELECT USING (status = 'approved'); -- Public can only see approved schools

CREATE POLICY "directory_manual_schools_admin_all" ON directory_manual_schools 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
); -- DSVI admins can manage all manual schools

-- Directory Ads Policies
CREATE POLICY "directory_ads_school_admin_manage" ON directory_ads 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (
    -- DSVI school admins can manage ads for their schools
    (school_type = 'dsvi' AND school_id IN (
      SELECT id FROM schools WHERE admin_user_id = auth.uid()
    )) OR
    -- DSVI admins can manage all ads
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
  )
);

CREATE POLICY "directory_ads_public_read_active" ON directory_ads 
FOR SELECT USING (status = 'active' AND expires_at > CURRENT_TIMESTAMP); -- Public can see active ads

-- Directory Ad Targeting Policies
CREATE POLICY "directory_ad_targeting_inherit" ON directory_ad_targeting 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  ad_id IN (
    SELECT id FROM directory_ads WHERE 
    (
      -- School admins can manage targeting for their ads
      (school_type = 'dsvi' AND school_id IN (
        SELECT id FROM schools WHERE admin_user_id = auth.uid()
      )) OR
      -- DSVI admins can manage all targeting
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
    )
  )
);

-- ===============================================================================
-- HELPER FUNCTIONS
-- ===============================================================================

-- Function to get directory statistics
CREATE OR REPLACE FUNCTION get_directory_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_dsvi_schools', (SELECT COUNT(*) FROM schools),
    'total_manual_schools', (SELECT COUNT(*) FROM directory_manual_schools WHERE status = 'approved'),
    'pending_manual_schools', (SELECT COUNT(*) FROM directory_manual_schools WHERE status = 'pending'),
    'total_visitors', (SELECT COUNT(*) FROM directory_visitors),
    'active_ads', (SELECT COUNT(*) FROM directory_ads WHERE status = 'active' AND expires_at > CURRENT_TIMESTAMP),
    'pending_ads', (SELECT COUNT(*) FROM directory_ads WHERE status = 'pending')
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve manual school submission
CREATE OR REPLACE FUNCTION approve_manual_school(
  p_school_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE directory_manual_schools 
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = CURRENT_TIMESTAMP,
    admin_notes = COALESCE(p_notes, admin_notes),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_school_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve ad campaign
CREATE OR REPLACE FUNCTION approve_ad_campaign(
  p_ad_id UUID,
  p_admin_id UUID,
  p_duration_days INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE directory_ads 
  SET 
    status = 'approved',
    approved_by = p_admin_id,
    approved_at = CURRENT_TIMESTAMP,
    expires_at = CURRENT_TIMESTAMP + (p_duration_days || ' days')::INTERVAL,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_ad_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE directory_visitors IS 'Stores visitor signup data for the school directory';
COMMENT ON TABLE directory_manual_schools IS 'Non-DSVI schools submitted to the directory';
COMMENT ON TABLE directory_ads IS 'Promotional ad campaigns for schools in the directory';
COMMENT ON TABLE directory_ad_targeting IS 'Targeting criteria for ad campaigns';

SELECT 'GyaWe School Directory database schema created successfully!' as status;
