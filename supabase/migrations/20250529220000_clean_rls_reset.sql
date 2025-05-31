-- Clean RLS Policy Reset
-- Date: 2025-05-29
-- Purpose: Completely reset and fix all project_tasks RLS policies

-- First, drop ALL existing policies for project_tasks
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies for project_tasks table
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies 
        WHERE tablename = 'project_tasks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_tasks', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create new, correct policies for anon key usage
CREATE POLICY "project_tasks_select_all" ON project_tasks 
FOR SELECT USING (true);

CREATE POLICY "project_tasks_update_all" ON project_tasks 
FOR UPDATE USING (true);

CREATE POLICY "project_tasks_insert_all" ON project_tasks 
FOR INSERT WITH CHECK (true);

CREATE POLICY "project_tasks_delete_all" ON project_tasks 
FOR DELETE USING (true);

-- Verify the new policies
SELECT 'Checking new policies:' as status;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'project_tasks'
ORDER BY policyname;

SELECT 'RLS policies completely reset and fixed!' as result;
