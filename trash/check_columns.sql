-- Simple check: What's the real error?

-- Check the exact columns in dsvi_admins
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins' 
ORDER BY ordinal_position;

-- Check if all required columns exist for the INSERT
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'user_id') THEN 'YES' ELSE 'NO' END as has_user_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'email') THEN 'YES' ELSE 'NO' END as has_email,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'name') THEN 'YES' ELSE 'NO' END as has_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'admin_level') THEN 'YES' ELSE 'NO' END as has_admin_level,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'permissions') THEN 'YES' ELSE 'NO' END as has_permissions,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'school_ids') THEN 'YES' ELSE 'NO' END as has_school_ids,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'notes') THEN 'YES' ELSE 'NO' END as has_notes,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'created_by') THEN 'YES' ELSE 'NO' END as has_created_by,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'invite_token') THEN 'YES' ELSE 'NO' END as has_invite_token,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsvi_admins' AND column_name = 'signup_completed_at') THEN 'YES' ELSE 'NO' END as has_signup_completed_at;
