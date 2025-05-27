-- DIAGNOSTIC: Check why school admins aren't showing in DSVI admin dashboard
-- Run this in Supabase SQL Editor to see the current state

-- 1. Check all schools and their admin assignments
SELECT 'Current schools and admin status:' as info;
SELECT 
    s.id as school_id,
    s.name as school_name,
    s.admin_user_id,
    CASE 
        WHEN s.admin_user_id IS NOT NULL THEN 'Has Admin ✅'
        ELSE 'No Admin ❌'
    END as display_status
FROM schools s
ORDER BY s.name;

-- 2. Check users who are school admins (from metadata)
SELECT 'Users with SCHOOL_ADMIN role:' as info;
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data ->> 'role' as role,
    u.raw_user_meta_data ->> 'school_id' as assigned_school_id,
    s.name as school_name
FROM auth.users u
LEFT JOIN schools s ON s.id = (u.raw_user_meta_data ->> 'school_id')::uuid
WHERE u.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
ORDER BY u.email;

-- 3. Find the mismatch - admins who should be assigned but aren't
SELECT 'MISMATCH - Users who should be assigned but admin_user_id is NULL:' as info;
SELECT 
    u.id as user_id,
    u.email as admin_email,
    (u.raw_user_meta_data ->> 'school_id')::uuid as school_id,
    s.name as school_name,
    s.admin_user_id as current_admin_user_id
FROM auth.users u
JOIN schools s ON s.id = (u.raw_user_meta_data ->> 'school_id')::uuid
WHERE u.raw_user_meta_data ->> 'role' = 'SCHOOL_ADMIN'
  AND s.admin_user_id IS NULL;