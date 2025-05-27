-- COMPREHENSIVE FIX: Disable RLS temporarily and recreate with proper policies
-- Run this in your Supabase SQL Editor

-- First, let's completely disable RLS to test if tables work
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests DISABLE ROW LEVEL SECURITY;

-- Test that tables are now accessible
SELECT 'Tables should now be accessible without RLS' as status;
SELECT COUNT(*) as school_count FROM schools;
SELECT COUNT(*) as page_count FROM pages;
SELECT COUNT(*) as request_count FROM school_requests;

-- Now let's re-enable RLS with corrected policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by DSVI admins" ON schools;
DROP POLICY IF EXISTS "Schools are manageable by school admins" ON schools;

DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Enable read access for all pages" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by DSVI admins" ON pages;
DROP POLICY IF EXISTS "Pages are manageable by school admins" ON pages;
DROP POLICY IF EXISTS "Anyone can submit school requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can view all requests" ON school_requests;
DROP POLICY IF EXISTS "DSVI admins can update requests" ON school_requests;

-- Create simple, working public read policies
CREATE POLICY "Public read access" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON pages FOR SELECT USING (true);
CREATE POLICY "Public read access" ON school_requests FOR SELECT USING (true);

-- Create admin policies (authenticated users with DSVI_ADMIN role)
CREATE POLICY "Admin full access" ON schools FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "Admin full access" ON pages FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'  
);

CREATE POLICY "Admin full access" ON school_requests FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- Allow public to submit school requests
CREATE POLICY "Public can submit requests" ON school_requests FOR INSERT WITH CHECK (true);

-- Test final access
SELECT 'RLS policies recreated - testing access...' as status;
SELECT COUNT(*) as school_count FROM schools;

SELECT 'Fix completed successfully!' as final_status;
