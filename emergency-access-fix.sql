-- EMERGENCY QUICK FIX - Run this FIRST to restore access immediately
-- Copy and paste this in Supabase SQL Editor

-- Temporarily disable RLS to restore immediate access
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests DISABLE ROW LEVEL SECURITY;

-- Check if this fixes access
SELECT 'RLS disabled - testing access...' as step;
SELECT COUNT(*) as total_schools FROM schools;
SELECT 'If you can see schools now, the RLS policies were the problem.' as result;

-- You can run fix-dsvi-admin-access.sql later to properly configure RLS
-- For now, this will restore your admin dashboard functionality