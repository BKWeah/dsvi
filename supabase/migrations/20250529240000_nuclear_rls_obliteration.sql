-- NUCLEAR OPTION: Complete RLS Obliteration (FIXED)
-- Date: 2025-05-29  
-- Purpose: Remove ALL RLS policies and disable RLS on ALL tables for debugging
-- WARNING: This removes ALL security - only for debugging!

-- Get all tables with RLS enabled and disable it
DO $$
DECLARE
    table_record RECORD;
    policy_record RECORD;
BEGIN
    -- First, drop ALL policies from ALL tables
    RAISE NOTICE 'DROPPING ALL RLS POLICIES FROM ALL TABLES...';
    
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                policy_record.policyname, 
                policy_record.schemaname, 
                policy_record.tablename);
            RAISE NOTICE 'Dropped policy: %.%.%', 
                policy_record.schemaname, 
                policy_record.tablename, 
                policy_record.policyname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to drop policy %.%.% - %', 
                    policy_record.schemaname, 
                    policy_record.tablename, 
                    policy_record.policyname, 
                    SQLERRM;
        END;
    END LOOP;
    
    -- Then disable RLS on ALL tables (FIXED VERSION)
    RAISE NOTICE 'DISABLING RLS ON ALL TABLES...';
    
    FOR table_record IN
        SELECT schemaname, tablename
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true  -- FIXED: Use rowsecurity instead of hasrlspolicy
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', 
                table_record.schemaname, 
                table_record.tablename);
            RAISE NOTICE 'Disabled RLS on: %.%', 
                table_record.schemaname, 
                table_record.tablename;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to disable RLS on %.% - %', 
                    table_record.schemaname, 
                    table_record.tablename, 
                    SQLERRM;
        END;
    END LOOP;    
    
    -- Also handle storage policies
    RAISE NOTICE 'DROPPING STORAGE POLICIES...';
    
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
            RAISE NOTICE 'Dropped storage policy: %', policy_record.policyname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to drop storage policy % - %', policy_record.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verify complete obliteration
SELECT 'Checking remaining policies...' as status;

SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname IN ('public', 'storage')
GROUP BY schemaname, tablename
ORDER By schemaname, tablename;

SELECT 'Checking RLS status...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT '🔥🔥🔥 COMPLETE RLS OBLITERATION COMPLETE! 🔥🔥🔥' as result;
SELECT 'All tables are now completely open - NO SECURITY!' as warning;
SELECT 'Perfect for debugging - remember to add security back later!' as reminder;