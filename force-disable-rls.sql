-- FORCE DISABLE RLS: More aggressive approach
-- Run this if RLS is still enabled

-- First, drop ALL policies to remove any interference
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on schools table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'schools') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON schools', r.policyname);
    END LOOP;
    
    -- Drop all policies on pages table  
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pages') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON pages', r.policyname);
    END LOOP;
    
    -- Drop all policies on school_requests table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'school_requests') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON school_requests', r.policyname);
    END LOOP;
END $$;

-- Now force disable RLS
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;  
ALTER TABLE school_requests DISABLE ROW LEVEL SECURITY;

-- Grant explicit permissions (just in case)
GRANT ALL ON schools TO anon;
GRANT ALL ON pages TO anon;
GRANT ALL ON school_requests TO anon;

GRANT ALL ON schools TO authenticated;
GRANT ALL ON pages TO authenticated;
GRANT ALL ON school_requests TO authenticated;

-- Test that everything works
SELECT 'Testing after forced RLS disable...' as status;
SELECT COUNT(*) as school_count FROM schools;
SELECT COUNT(*) as page_count FROM pages;
SELECT COUNT(*) as request_count FROM school_requests;

SELECT '✅ FORCED RLS DISABLE COMPLETED!' as final_status;
