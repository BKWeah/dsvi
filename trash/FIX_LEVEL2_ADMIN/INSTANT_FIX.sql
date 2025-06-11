-- ===============================================================================
-- QUICK FIX: Just Make It Work Now!
-- ===============================================================================

-- 1. Clean duplicates
DELETE FROM user_profiles WHERE email IN (
    SELECT email FROM user_profiles GROUP BY email HAVING COUNT(*) > 1
) AND id NOT IN (
    SELECT id FROM auth.users
);

-- 2. Fix existing Level 2 admins missing school assignments
INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
SELECT DISTINCT
    u.id,
    unnest(pai.school_ids),
    u.id,
    NOW(),
    TRUE
FROM auth.users u
JOIN pending_admin_invitations pai ON pai.email = u.email
JOIN admin_profiles ap ON ap.user_id = u.id
WHERE ap.admin_level = 2
  AND pai.school_ids IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM admin_assignments aa 
    WHERE aa.admin_user_id = u.id
  )
ON CONFLICT DO NOTHING;

-- 3. Same for admin_school_assignments
INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
SELECT DISTINCT
    u.id,
    unnest(pai.school_ids),
    u.id,
    NOW(),
    TRUE
FROM auth.users u
JOIN pending_admin_invitations pai ON pai.email = u.email
JOIN admin_profiles ap ON ap.user_id = u.id
WHERE ap.admin_level = 2
  AND pai.school_ids IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM admin_school_assignments asa 
    WHERE asa.admin_user_id = u.id
  )
ON CONFLICT DO NOTHING;

-- 4. Show results
SELECT 
    'Fixed Level 2 Admins' as report,
    u.email,
    up.name,
    COUNT(DISTINCT aa.school_id) as schools_assigned
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
WHERE ap.admin_level = 2
GROUP BY u.id, u.email, up.name
ORDER BY u.created_at DESC;

SELECT 'Quick fix applied! Check admin_assignments table now.' as status;
