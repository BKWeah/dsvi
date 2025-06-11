-- ===============================================================================
-- QUICK CHECK: Why School Assignments Aren't Created
-- ===============================================================================

-- 1. Check the invitations - do they have school_ids?
SELECT 
    email,
    name,
    school_ids,
    array_length(school_ids, 1) as school_count,
    permissions,
    is_used,
    created_at
FROM pending_admin_invitations
ORDER BY created_at DESC;

-- 2. Check if those school IDs actually exist
SELECT 
    pai.email as invitation_email,
    s.id as school_id,
    s.name as school_name,
    CASE 
        WHEN s.id IS NULL THEN 'INVALID SCHOOL ID'
        ELSE 'Valid School'
    END as status
FROM pending_admin_invitations pai
CROSS JOIN LATERAL unnest(pai.school_ids) AS school_id
LEFT JOIN schools s ON s.id = school_id
WHERE pai.school_ids IS NOT NULL;

-- 3. Check recent Level 2 admins and their assignments
SELECT 
    u.email,
    u.created_at as user_created,
    up.name,
    COUNT(DISTINCT aa.school_id) as assigned_schools,
    pai.school_ids as invitation_schools,
    array_length(pai.school_ids, 1) as expected_schools
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
LEFT JOIN pending_admin_invitations pai ON pai.email = u.email AND pai.is_used = TRUE
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
  AND u.created_at > NOW() - INTERVAL '1 day'
GROUP BY u.id, u.email, u.created_at, up.name, pai.school_ids
ORDER BY u.created_at DESC;

-- 4. The issue might be that school IDs in invitations don't exist
-- Let's create a test with valid school IDs
DO $$
DECLARE
    valid_school_ids UUID[];
    test_result JSON;
BEGIN
    -- Get 2 valid school IDs
    SELECT array_agg(id) INTO valid_school_ids
    FROM (SELECT id FROM schools LIMIT 2) s;
    
    RAISE NOTICE 'Valid school IDs found: %', valid_school_ids;
    
    -- Update one unused invitation with valid school IDs
    UPDATE pending_admin_invitations
    SET school_ids = valid_school_ids
    WHERE is_used = FALSE
      AND email LIKE 'test%'
    LIMIT 1;
    
    RAISE NOTICE 'Updated test invitation with valid school IDs';
END $$;

SELECT 'Check complete. Look for INVALID SCHOOL ID in the results above!' as message;
