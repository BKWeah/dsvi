-- PART 2: Check all required functions exist (FIXED)
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
