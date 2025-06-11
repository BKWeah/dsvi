-- ===============================================================================
-- DIAGNOSE: Why School IDs in Invitations Don't Create Assignments
-- ===============================================================================

-- 1. Show all invitations with their school IDs
SELECT 
    id,
    email,
    name,
    school_ids,
    array_length(school_ids, 1) as school_count,
    is_used,
    created_at
FROM pending_admin_invitations
WHERE school_ids IS NOT NULL
ORDER BY created_at DESC;

-- 2. Check if those school IDs are valid
WITH invitation_schools AS (
    SELECT 
        pai.email,
        pai.name,
        unnest(pai.school_ids) as school_id
    FROM pending_admin_invitations pai
    WHERE pai.school_ids IS NOT NULL
)
SELECT 
    is.email,
    is.name,
    is.school_id as invitation_school_id,
    s.id as actual_school_id,
    s.name as school_name,
    CASE 
        WHEN s.id IS NULL THEN '❌ INVALID - School does not exist!'
        ELSE '✅ Valid'
    END as status
FROM invitation_schools is
LEFT JOIN schools s ON s.id = is.school_id;

-- 3. Show which Level 2 admins should have schools but don't
SELECT 
    u.email,
    up.name,
    pai.school_ids as invitation_schools,
    array_length(pai.school_ids, 1) as expected_schools,
    COUNT(aa.id) as actual_assignments
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN pending_admin_invitations pai ON pai.email = u.email
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
WHERE ap.admin_level = 2
  AND pai.school_ids IS NOT NULL
  AND array_length(pai.school_ids, 1) > 0
GROUP BY u.id, u.email, up.name, pai.school_ids
HAVING COUNT(aa.id) = 0
ORDER BY u.created_at DESC;

-- 4. List all schools to see what's available
SELECT 
    id,
    name,
    CASE 
        WHEN admin_user_id IS NOT NULL THEN 'Has Admin'
        ELSE 'No Admin'
    END as admin_status
FROM schools
ORDER BY name
LIMIT 20;

-- 5. Manual fix for existing Level 2 admins without assignments
DO $$
DECLARE
    admin RECORD;
    inv RECORD;
    school_id UUID;
    fixed_count INTEGER := 0;
BEGIN
    -- Find Level 2 admins without assignments but with invitations
    FOR admin IN 
        SELECT u.id, u.email, pai.school_ids
        FROM auth.users u
        JOIN admin_profiles ap ON ap.user_id = u.id
        JOIN pending_admin_invitations pai ON pai.email = u.email
        LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
        WHERE ap.admin_level = 2
          AND aa.id IS NULL
          AND pai.school_ids IS NOT NULL
          AND array_length(pai.school_ids, 1) > 0
    LOOP
        RAISE NOTICE 'Fixing assignments for %', admin.email;
        
        FOREACH school_id IN ARRAY admin.school_ids
        LOOP
            INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (admin.id, school_id, admin.id, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
            
            INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (admin.id, school_id, admin.id, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Fixed % admins with missing assignments', fixed_count;
END $$;

SELECT 'Diagnostic complete. Check results above for INVALID schools!' as message;
