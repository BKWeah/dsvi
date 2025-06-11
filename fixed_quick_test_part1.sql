-- FIXED QUICK TEST: Level 2 Admin System
-- Run this to quickly test if everything is working

-- 1. Check all required tables exist
SELECT 
    'user_profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'admin_profiles', 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'admin_permissions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_permissions') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'admin_assignments',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_assignments') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END;
