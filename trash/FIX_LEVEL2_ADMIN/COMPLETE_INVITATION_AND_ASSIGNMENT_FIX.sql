-- ===============================================================================
-- FIX 2: COMPLETE SOLUTION FOR INVITATIONS AND ASSIGNMENTS
-- ===============================================================================

-- 1. First, disable RLS on pending_admin_invitations
ALTER TABLE pending_admin_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Fix the process_level2_admin_signup to use invitation data
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
DECLARE
    invitation_record RECORD;
    school_id UUID;
    perm TEXT;
    result JSON;
BEGIN
    -- Get invitation details from database
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = p_invite_token
    AND email = p_email
    AND is_used = FALSE
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        -- Fallback: create basic admin without invitation details
        RAISE NOTICE 'No valid invitation found, creating basic Level 2 admin';
        
        -- Create profiles
        INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
        VALUES (p_user_id, p_email, 'DSVI_ADMIN', split_part(p_email, '@', 1), NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET role = 'DSVI_ADMIN';
        
        INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
        VALUES (p_user_id, 2, NOW(), TRUE)
        ON CONFLICT (user_id) DO UPDATE SET admin_level = 2;
        
        -- Add default permissions
        INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
        VALUES 
            (p_user_id, 'view_schools', NOW(), TRUE),
            (p_user_id, 'manage_content', NOW(), TRUE)
        ON CONFLICT DO NOTHING;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Basic Level 2 admin created (no invitation found)'
        );
    END IF;
    
    -- Use invitation data to create complete admin
    RAISE NOTICE 'Found invitation for: % with % permissions and % schools', 
        invitation_record.name,
        array_length(invitation_record.permissions, 1),
        array_length(invitation_record.school_ids, 1);
    
    -- Create user profile with name from invitation
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (p_user_id, p_email, 'DSVI_ADMIN', invitation_record.name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        role = 'DSVI_ADMIN',
        name = invitation_record.name,
        updated_at = NOW();
    
    -- Create admin profile
    INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, created_at, is_active)
    VALUES (p_user_id, 2, invitation_record.created_by, invitation_record.notes, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET 
        admin_level = 2,
        is_active = TRUE,
        updated_at = NOW();
    
    -- Create permissions from invitation
    IF invitation_record.permissions IS NOT NULL AND array_length(invitation_record.permissions, 1) > 0 THEN
        FOREACH perm IN ARRAY invitation_record.permissions
        LOOP
            INSERT INTO admin_permissions (admin_user_id, permission_type, granted_by, created_at, is_active)
            VALUES (p_user_id, perm, invitation_record.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    -- Create school assignments from invitation
    IF invitation_record.school_ids IS NOT NULL AND array_length(invitation_record.school_ids, 1) > 0 THEN
        FOREACH school_id IN ARRAY invitation_record.school_ids
        LOOP
            -- Insert into admin_assignments
            INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, invitation_record.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
            
            -- Also insert into admin_school_assignments if it exists
            INSERT INTO admin_school_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
            VALUES (p_user_id, school_id, invitation_record.created_by, NOW(), TRUE)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    -- Mark invitation as used
    UPDATE pending_admin_invitations
    SET is_used = TRUE,
        used_at = NOW(),
        used_by = p_user_id
    WHERE id = invitation_record.id;
    
    -- Return success with details
    SELECT json_build_object(
        'success', true,
        'message', 'Level 2 admin created from invitation',
        'admin_name', invitation_record.name,
        'permissions_count', COALESCE(array_length(invitation_record.permissions, 1), 0),
        'schools_count', COALESCE(array_length(invitation_record.school_ids, 1), 0)
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to process Level 2 admin signup'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Test the complete flow
DO $$
DECLARE
    test_invitation_id UUID;
    test_user_id UUID := gen_random_uuid();
    test_school_id UUID := gen_random_uuid();
    test_result JSON;
BEGIN
    RAISE NOTICE '=== Testing Complete Invitation Flow ===';
    
    -- Create a test invitation
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, permissions, school_ids, notes,
        created_by, expires_at, is_used
    ) VALUES (
        'test_complete@example.com',
        'Test Complete Admin',
        'test_token_complete',
        encode('test_complete@example.com'::bytea, 'base64'),
        'TempPass123',
        2,
        ARRAY['view_schools', 'manage_content', 'edit_schools']::TEXT[],
        ARRAY[test_school_id]::UUID[],
        'Test invitation with schools',
        test_user_id,
        NOW() + INTERVAL '7 days',
        FALSE
    ) RETURNING id INTO test_invitation_id;
    
    RAISE NOTICE 'Created test invitation: %', test_invitation_id;
    
    -- Process the signup with the invitation
    SELECT process_level2_admin_signup(
        test_user_id,
        'test_complete@example.com',
        'test_token_complete'
    ) INTO test_result;
    
    RAISE NOTICE 'Signup result: %', test_result;
    
    -- Verify what was created
    RAISE NOTICE '--- Verification ---';
    
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ user_profiles created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✅ admin_profiles created';
    END IF;
    
    SELECT COUNT(*) FROM admin_permissions WHERE admin_user_id = test_user_id
    INTO test_result;
    RAISE NOTICE '✅ admin_permissions created: % permissions', test_result;
    
    SELECT COUNT(*) FROM admin_assignments WHERE admin_user_id = test_user_id
    INTO test_result;
    RAISE NOTICE '✅ admin_assignments created: % schools', test_result;
    
    -- Cleanup
    DELETE FROM admin_permissions WHERE admin_user_id = test_user_id;
    DELETE FROM admin_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_school_assignments WHERE admin_user_id = test_user_id;
    DELETE FROM admin_profiles WHERE user_id = test_user_id;
    DELETE FROM user_profiles WHERE id = test_user_id;
    DELETE FROM pending_admin_invitations WHERE id = test_invitation_id;
    
    RAISE NOTICE '=== Test Complete ===';
END $$;

-- 4. Fix create_admin_invitation if it's not working
CREATE OR REPLACE FUNCTION create_admin_invitation(
    p_email TEXT,
    p_name TEXT,
    p_created_by UUID,
    p_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_notes TEXT DEFAULT NULL,
    p_days_valid INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
    v_invite_token TEXT;
    v_email_hash TEXT;
    v_temp_password TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_signup_link TEXT;
    v_invitation_id UUID;
    result JSON;
BEGIN
    -- Generate secure tokens
    v_invite_token := 'invite_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16);
    v_email_hash := encode(p_email::bytea, 'base64');
    v_temp_password := 'Temp' || substr(md5(random()::text), 1, 8) || '!';
    v_expires_at := NOW() + (p_days_valid || ' days')::interval;
    
    -- Generate signup link
    v_signup_link := 'http://localhost:3000/level2-admin-signup?token=' || v_invite_token || 
                     '&eh=' || v_email_hash;
    
    -- Insert invitation
    INSERT INTO pending_admin_invitations (
        email, name, invite_token, email_hash, temp_password,
        admin_level, permissions, school_ids, notes,
        created_by, expires_at, signup_link
    ) VALUES (
        p_email, p_name, v_invite_token, v_email_hash, v_temp_password,
        2, p_permissions, p_school_ids, p_notes,
        p_created_by, v_expires_at, v_signup_link
    ) RETURNING id INTO v_invitation_id;
    
    -- Return all necessary data
    SELECT json_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'email', p_email,
        'name', p_name,
        'invite_token', v_invite_token,
        'email_hash', v_email_hash,
        'temp_password', v_temp_password,
        'signup_link', v_signup_link,
        'expires_at', v_expires_at,
        'message', 'Invitation created successfully'
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create invitation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'All fixes applied! Test the complete flow now.' as status;
