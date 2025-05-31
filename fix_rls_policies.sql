-- Fix RLS Policies for project_tasks table
-- This addresses the 403 Forbidden error

-- Drop the incorrect policies
DROP POLICY IF EXISTS "project_tasks_public_read" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_authenticated_all" ON project_tasks;

-- Create correct policies
-- Allow public read access (for client approval page)
CREATE POLICY "project_tasks_public_read" ON project_tasks 
FOR SELECT USING (true);

-- Allow public write access for approvals (since you're using anon key)
-- In production, you might want to restrict this more
CREATE POLICY "project_tasks_public_update" ON project_tasks 
FOR UPDATE USING (true);

-- If you need insert access (for creating new tasks)
CREATE POLICY "project_tasks_public_insert" ON project_tasks 
FOR INSERT WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'project_tasks';
