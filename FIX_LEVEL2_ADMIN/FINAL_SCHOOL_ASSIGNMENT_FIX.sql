-- ===============================================================================
-- FINAL FIX: School Assignments and Duplicate User Profiles
-- ===============================================================================

-- 1. First check why we have duplicate user_profiles
SELECT 
    u.id as auth_user_id,
    u.email,
    up.id as profile_id,
    up.name,
    up.created_at,
    u.raw_user_meta_data->>'inviteToken' as invite_token
FROM auth.users u
JOIN user_profiles up ON up.email = u.email
WHERE u.email IN ('tuesday@afternoon.com', 'tuesday2@test.com')
ORDER BY u.email, up.created_at;

-- 2. Fix the process_level2_admin_signup to prevent duplicates and create school assignments
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    invitation RECORD;
    school_id UUID;
    perm TEXT;
    assignment_count INTEGER := 0;
BEGIN
    -- Get invitation from database
    SELECT * INTO invitation
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND email = p_email
    AND is_used = FALSE
    AND expires_at > NOW();
    
    -- Delete any duplicate user_profile entries first
    DELETE FROM user_profiles WHERE email = p_email AND id != p_user_id;
    
    -- Create/update user profile with correct name from invitation
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (
        p_user_id, 
        p_email, 
        'DSVI_ADMIN', 
        COALESCE(invitation.name, split_part(p_email, '@', 1)),
        NOW(), 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        role = 'DSVI_ADMIN',
        name = COALESCE(invitation.name, EXCLUDED.name),
        email = p_email,
        updated_at = NOW();
    
    -- Create admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, is_active)
    VALUES (
        p_user_id, 
        2, 
        COALESCE(invitation.created_by, p_user_id), 
        invitation.notes, 
        NOW(), 
        TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET 
        admin_level = 2,
        is_active = TRUE,
        updated_at = NOW();
    
    -- Create permissions
    IF invitation.permissions IS NOT NULL AND array_length(invitation.permissions, 1) > 0 THEN
        FOREACH perm IN ARRAY invitation.permissions
        LOOP
            INSERT INTO admin_permissions (admin_user_id, permission_type, granted_by, created_at, is_active)
            VALUES (p_user_id, perm, invitation.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    ELSE
        -- Default permissions
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES 
            (p_user_id, 'view_schools', NOW(), TRUE),
            (p_user_id, 'manage_content', NOW(), TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- CREATE SCHOOL ASSIGNMENTS - THIS IS THE MISSING PART!
    IF invitation.school_ids IS NOT NULL AND array_length(invitation.school_ids, 1) > 0 THEN
        RAISE NOTICE 'Creating school assignments for % schools', array_length(invitation.school_ids, 1);
        
        FOREACH school_id IN ARRAY invitation.school_ids
        LOOP
            -- Check if school exists
            IF EXISTS (SELECT 1 FROM schools WHERE id = school_id) THEN
                -- Insert into admin_assignments
                INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
                VALUES (p_user_id, school_id, invitation.created_by, NOW(), TRUE)
                ON CONFLICT (admin_user_id, school_id) DO NOTHING;
                
                -- Insert into admin_school_assignments
                INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
                VALUES (p_user_id, school_id, invitation.created_by, NOW(), TRUE)
                ON CONFLICT (admin_user_id, school_id) DO NOTHING;
                
                assignment_count := assignment_count + 1;
                RAISE NOTICE 'Assigned school % to admin', school_id;
            ELSE
                RAISE NOTICE 'School % does not exist, skipping', school_id;
            END IF;
        END LOOP;
    END IF;
    
    -- Mark invitation as used
    IF invitation.id IS NOT NULL THEN
        UPDATE pending_admin_invitations 
        SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
        WHERE id = invitation.id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', format('Level 2 admin created with %s school assignments', assignment_count),
        'school_assignments', assignment_count
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to process Level 2 admin signup'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Clean up duplicate user_profiles entries
-- Remove duplicates keeping only the one matching auth user ID
DELETE FROM user_profiles up1
WHERE up1.email IN (
    SELECT email 
    FROM user_profiles 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
AND up1.id NOT IN (
    SELECT u.id 
    FROM auth.users u 
    WHERE u.email = up1.email
);

-- 4. Verify school assignments are created for recent signups
SELECT 
    u.email,
    up.name,
    ap.admin_level,
    COUNT(DISTINCT perm.id) as permissions,
    COUNT(DISTINCT aa.school_id) as schools_in_assignments,
    COUNT(DISTINCT asa.school_id) as schools_in_school_assignments,
    array_agg(DISTINCT s.name) as assigned_school_names
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN admin_permissions perm ON perm.admin_user_id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
LEFT JOIN admin_school_assignments asa ON asa.admin_user_id = u.id
LEFT JOIN schools s ON s.id = aa.school_id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
  AND ap.admin_level = 2
  AND u.created_at > NOW() - INTERVAL '1 day'
GROUP BY u.id, u.email, up.name, ap.admin_level
ORDER BY u.created_at DESC;

-- 5. Test with a real user and real school
DO $$
DECLARE
    test_invitation RECORD;
    test_school RECORD;
    result JSON;
BEGIN
    -- Get a real school
    SELECT * INTO test_school FROM schools LIMIT 1;
    
    IF test_school.id IS NULL THEN
        RAISE NOTICE 'No schools found in database';
        RETURN;
    END IF;
    
    -- Get the most recent invitation
    SELECT * INTO test_invitation
    FROM pending_admin_invitations
    WHERE is_used = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF test_invitation.id IS NOT NULL THEN
        RAISE NOTICE 'Testing with invitation: % for email: %', test_invitation.invite_token, test_invitation.email;
        RAISE NOTICE 'Invitation has % schools assigned', array_length(test_invitation.school_ids, 1);
        
        -- Show the schools in the invitation
        IF test_invitation.school_ids IS NOT NULL THEN
            FOR i IN 1..array_length(test_invitation.school_ids, 1) LOOP
                RAISE NOTICE 'School ID %: %', i, test_invitation.school_ids[i];
            END LOOP;
        END IF;
    END IF;
END $$;

-- 6. Check why school assignments might not be created
-- Are the school IDs in invitations valid?
SELECT 
    pai.email,
    pai.name,
    pai.school_ids,
    array_length(pai.school_ids, 1) as schools_count,
    COUNT(s.id) as valid_schools,
    array_agg(s.name) as school_names
FROM pending_admin_invitations pai
LEFT JOIN schools s ON s.id = ANY(pai.school_ids)
WHERE pai.school_ids IS NOT NULL 
  AND array_length(pai.school_ids, 1) > 0
GROUP BY pai.id, pai.email, pai.name, pai.school_ids
ORDER BY pai.created_at DESC
LIMIT 10;

-- 7. Manual test - create school assignment for existing Level 2 admin
DO $$
DECLARE
    admin_user RECORD;
    school RECORD;
BEGIN
    -- Get a Level 2 admin without school assignments
    SELECT u.id, u.email 
    INTO admin_user
    FROM auth.users u
    JOIN admin_profiles ap ON ap.user_id = u.id
    LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
    WHERE ap.admin_level = 2
      AND aa.id IS NULL
    LIMIT 1;
    
    -- Get a school
    SELECT * INTO school FROM schools LIMIT 1;
    
    IF admin_user.id IS NOT NULL AND school.id IS NOT NULL THEN
        RAISE NOTICE 'Manually assigning school % to admin %', school.name, admin_user.email;
        
        INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
        VALUES (admin_user.id, school.id, admin_user.id, NOW(), TRUE)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
        VALUES (admin_user.id, school.id, admin_user.id, NOW(), TRUE)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Assignment complete';
    ELSE
        RAISE NOTICE 'No suitable admin or school found';
    END IF;
END $$;

SELECT 'School assignment fix applied! Test creating a new Level 2 admin with schools selected.' as status;
