-- Check current RLS policies for project_tasks table
SELECT 
    schemaname,
    tablename, 
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'project_tasks'
ORDER BY policyname;

-- Also check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'project_tasks';
