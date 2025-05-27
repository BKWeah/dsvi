-- QUICK FIX: Update RLS policies for better public access
-- Run this in your Supabase SQL Editor

-- Drop and recreate the schools viewing policy with better syntax
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;

-- Create a more permissive policy for public access
CREATE POLICY "Enable read access for all users" ON schools
  FOR SELECT 
  USING (true);

-- Also ensure pages are publicly readable
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;

CREATE POLICY "Enable read access for all pages" ON pages
  FOR SELECT 
  USING (true);

-- Test query to verify access
SELECT 'Policies updated successfully!' as status;
SELECT COUNT(*) as school_count FROM schools;
