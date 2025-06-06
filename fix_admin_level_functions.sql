-- Function to safely create admin profile with better error handling
CREATE OR REPLACE FUNCTION safe_create_admin_profile(
    p_user_id UUID,
    p_admin_level INTEGER,
    p_created_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_profile_id UUID;
    v_existing_profile RECORD;
    v_result JSON;
BEGIN
    -- Check if profile already exists
    SELECT id, admin_level, is_active 
    INTO v_existing_profile
    FROM admin_profiles 
    WHERE user_id = p_user_id;
    
    IF FOUND THEN
        -- Profile exists, update if needed
        IF v_existing_profile.admin_level != p_admin_level OR NOT v_existing_profile.is_active THEN
            UPDATE admin_profiles 
            SET 
                admin_level = p_admin_level,
                is_active = true,
                updated_at = NOW(),
                notes = COALESCE(p_notes, notes)
            WHERE id = v_existing_profile.id
            RETURNING id INTO v_profile_id;
            
            v_result := json_build_object(
                'success', true,
                'profile_id', v_profile_id,
                'action', 'updated',
                'message', 'Admin profile updated successfully'
            );
        ELSE
            v_result := json_build_object(
                'success', true,
                'profile_id', v_existing_profile.id,
                'action', 'exists',
                'message', 'Admin profile already exists with correct level'
            );
        END IF;
    ELSE
        -- Create new profile
        INSERT INTO admin_profiles (user_id, admin_level, created_by, notes, is_active)
        VALUES (p_user_id, p_admin_level, p_created_by, p_notes, true)
        RETURNING id INTO v_profile_id;
        
        v_result := json_build_object(
            'success', true,
            'profile_id', v_profile_id,
            'action', 'created',
            'message', 'Admin profile created successfully'
        );
    END IF;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to create/update admin profile'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin setup is complete
CREATE OR REPLACE FUNCTION verify_admin_setup(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
    v_permissions INTEGER;
    v_assignments INTEGER;
    v_result JSON;
BEGIN
    -- Get admin profile
    SELECT id, admin_level, is_active
    INTO v_profile
    FROM admin_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'has_profile', false,
            'message', 'No admin profile found'
        );
    END IF;
    
    -- Count permissions and assignments for Level 2 admins
    IF v_profile.admin_level = 2 THEN
        SELECT COUNT(*) INTO v_permissions
        FROM admin_permissions
        WHERE admin_user_id = p_user_id AND is_active = true;
        
        SELECT COUNT(*) INTO v_assignments
        FROM admin_assignments
        WHERE admin_user_id = p_user_id AND is_active = true;
        
        v_result := json_build_object(
            'success', true,
            'has_profile', true,
            'admin_level', v_profile.admin_level,
            'is_active', v_profile.is_active,
            'permissions_count', v_permissions,
            'assignments_count', v_assignments,
            'message', 'Level 2 admin setup verified'
        );
    ELSE
        v_result := json_build_object(
            'success', true,
            'has_profile', true,
            'admin_level', v_profile.admin_level,
            'is_active', v_profile.is_active,
            'message', 'Level 1 admin setup verified'
        );
    END IF;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Error verifying admin setup'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION safe_create_admin_profile TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_setup TO authenticated;
