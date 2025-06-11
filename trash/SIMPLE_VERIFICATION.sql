-- SIMPLE VERIFICATION: Just check if all functions exist
-- Run this after the corrected emergency fix to verify everything is ready

-- 1. Check if all required functions exist
SELECT 'FUNCTION STATUS CHECK:' as header;

SELECT 
    required_functions.routine_name,
    CASE WHEN r.routine_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
        ('create_level2_admin_complete'),
        ('safe_create_admin_profile'),
        ('upsert_user_profile'),
        ('grant_admin_permission'),
        ('assign_school_to_admin'),
        ('verify_admin_setup')
) AS required_functions(routine_name)
LEFT JOIN information_schema.routines r ON r.routine_name = required_functions.routine_name
ORDER BY required_functions.routine_name;

-- 2. Check table structure
SELECT 'USER_PROFILES TABLE STRUCTURE:' as header;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Simple readiness check
SELECT 
    CASE 
        WHEN (
            SELECT count(*) 
            FROM information_schema.routines 
            WHERE routine_name IN (
                'create_level2_admin_complete',
                'safe_create_admin_profile',
                'upsert_user_profile',
                'grant_admin_permission',
                'assign_school_to_admin',
                'verify_admin_setup'
            )
        ) = 6 
        THEN '🎉 ALL FUNCTIONS READY - Level 2 Admin signup should now work!'
        ELSE '❌ SOME FUNCTIONS MISSING - Check above for details'
    END as readiness_status;

SELECT 'Next step: Test Level 2 admin signup with real invitation!' as next_step;
