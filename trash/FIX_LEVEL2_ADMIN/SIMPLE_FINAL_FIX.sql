-- ===============================================================================
-- SIMPLE FIX FOR REMAINING ISSUES
-- Run this to fix duplicate profiles and enable school assignments
-- ===============================================================================

-- 1. Clean up duplicate user_profiles RIGHT NOW
DELETE FROM user_profiles up
WHERE up.email IN (
    SELECT email FROM user_profiles 
    GROUP BY email HAVING COUNT(*) > 1
)
AND up.id NOT IN (
    SELECT id FROM auth.users WHERE email = up.email
);

-- 2. Update the function to prevent duplicates and create assignments
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    inv RECORD;
    school_id UUID;
    perm TEXT;
    schools_created INTEGER := 0;
BEGIN
    -- Get invitation
    SELECT * INTO inv FROM pending_admin_invitations
    WHERE invite_token = p_invite_token 
    AND email = p_email 
    AND is_used = FALSE 
    AND expires_at > NOW();
    
    -- IMPORTANT: Use user ID as profile ID to prevent duplicates
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (
        p_user_id,  -- This ensures only one profile per user!
        p_email, 
        'DSVI_ADMIN', 
        COALESCE(inv.name, 'Level 2 Admin'),
        NOW(), 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = p_email,
        role = 'DSVI_ADMIN',
        name = COALESCE(inv.name, user_profiles.name),
        updated_at = NOW();
    
    -- Admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, is_active)
    VALUES (p_user_id, 2, COALESCE(inv.created_by, p_user_id), inv.notes, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET admin_level = 2, is_active = TRUE;
    
    -- Permissions
    IF inv.permissions IS NOT NULL THEN
        FOREACH perm IN ARRAY inv.permissions
        LOOP
            INSERT INTO admin_permissions (admin_user_id, permission_type, granted_by, created_at, is_active)
            VALUES (p_user_id, perm, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    ELSE
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES (p_user_id, 'view_schools', NOW(), TRUE), (p_user_id, 'manage_content', NOW(), TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCHOOL ASSIGNMENTS - with debugging
    IF inv.school_ids IS NOT NULL AND array_length(inv.school_ids, 1) > 0 THEN
        RAISE NOTICE 'Processing % schools for assignment', array_length(inv.school_ids, 1);
        
        FOREACH school_id IN ARRAY inv.school_ids
        LOOP
            RAISE NOTICE 'Assigning school %', school_id;
            
            -- Both tables
            INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
            
            INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, inv.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
            
            schools_created := schools_created + 1;
        END LOOP;
    END IF;
    
    -- Mark used
    IF inv.id IS NOT NULL THEN
        UPDATE pending_admin_invitations 
        SET is_used = TRUE, used_at = NOW(), used_by = p_user_id
        WHERE id = inv.id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', format('Level 2 admin created with %s schools', schools_created)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Quick verification
SELECT 
    'Duplicate Profiles Check' as check_type,
    email,
    COUNT(*) as profile_count
FROM user_profiles
GROUP BY email
HAVING COUNT(*) > 1;

SELECT 'Function updated! Create a new Level 2 admin to test.' as status;
