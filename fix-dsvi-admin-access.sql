-- EMERGENCY FIX: RLS and permissions for DSVI admin access to schools
-- Run this in Supabase SQL Editor to fix the "Failed to fetch schools" error

-- Step 1: Check current RLS status
SELECT 'Current RLS status:' as info;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('schools', 'pages', 'school_requests');

-- Step 2: Check current policies
SELECT 'Current RLS policies:' as info;
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('schools', 'pages', 'school_requests')
ORDER BY tablename, policyname;

-- Step 3: TEMPORARY FIX - Disable RLS completely (emergency solution)
SELECT 'Disabling RLS for emergency access...' as step;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests DISABLE ROW LEVEL SECURITY;

-- Step 4: Create proper policies for DSVI admin access
SELECT 'Creating proper access policies...' as step;

-- Re-enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY; 
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "dsvi_admin_full_access" ON schools;
DROP POLICY IF EXISTS "dsvi_admin_full_access" ON pages;
DROP POLICY IF EXISTS "dsvi_admin_full_access" ON school_requests;

-- Create policies for DSVI admin full access
CREATE POLICY "dsvi_admin_full_access" ON schools
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'DSVI_ADMIN' OR
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'DSVI_ADMIN'
    );

CREATE POLICY "dsvi_admin_full_access" ON pages
    FOR ALL  
    USING (
        auth.jwt() ->> 'role' = 'DSVI_ADMIN' OR
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'DSVI_ADMIN'
    );

CREATE POLICY "dsvi_admin_full_access" ON school_requests
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'DSVI_ADMIN' OR
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'DSVI_ADMIN'
    );
-- Step 5: Add school admin access policies
CREATE POLICY "school_admin_own_school" ON schools
    FOR ALL
    USING (
        admin_user_id = auth.uid() OR
        id = ((auth.jwt() ->> 'user_metadata')::json ->> 'school_id')::uuid
    );

CREATE POLICY "school_admin_own_pages" ON pages  
    FOR ALL
    USING (
        school_id = ((auth.jwt() ->> 'user_metadata')::json ->> 'school_id')::uuid
    );

-- Step 6: Enable public read access for school websites
CREATE POLICY "public_school_read" ON schools
    FOR SELECT
    USING (true);

CREATE POLICY "public_pages_read" ON pages
    FOR SELECT  
    USING (true);

-- Step 7: Test access
SELECT 'Testing access...' as step;
SELECT COUNT(*) as total_schools FROM schools;

SELECT 'DSVI admin access fix completed!' as status;
SELECT 'If you still get errors, temporarily disable RLS by running:' as note;
SELECT 'ALTER TABLE schools DISABLE ROW LEVEL SECURITY;' as emergency_command;