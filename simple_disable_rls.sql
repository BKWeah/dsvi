-- SIMPLE NUCLEAR OPTION: Just disable RLS on everything
-- Date: 2025-05-29  
-- Purpose: Quickest way to disable ALL security for debugging

-- Disable RLS on all main tables
ALTER TABLE IF EXISTS schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pages DISABLE ROW LEVEL SECURITY; 
ALTER TABLE IF EXISTS school_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_task_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_school_assignments DISABLE ROW LEVEL SECURITY;

-- Drop all known problematic policies specifically
DROP POLICY IF EXISTS "project_tasks_public_read" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_authenticated_all" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_public_update" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_public_insert" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_select_all" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_update_all" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_insert_all" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_delete_all" ON project_tasks;

SELECT 'RLS COMPLETELY DISABLED - ALL TABLES OPEN!' as result;
