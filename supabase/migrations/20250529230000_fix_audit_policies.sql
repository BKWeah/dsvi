-- Fix audit table policies as well
-- Date: 2025-05-29
-- Purpose: Fix project_task_audit RLS policies

-- Drop existing audit table policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies for project_task_audit table
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies 
        WHERE tablename = 'project_task_audit'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_task_audit', policy_record.policyname);
        RAISE NOTICE 'Dropped audit policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE project_task_audit ENABLE ROW LEVEL SECURITY;

-- Create simple policies for audit table
CREATE POLICY "project_task_audit_select_all" ON project_task_audit 
FOR SELECT USING (true);

CREATE POLICY "project_task_audit_insert_all" ON project_task_audit 
FOR INSERT WITH CHECK (true);

SELECT 'Audit table policies fixed!' as result;
