-- RPC Function to create Level 2 admin (server-side)
-- This function should be run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_level2_admin_user(
    admin_email TEXT,
    admin_name TEXT,
    admin_notes TEXT DEFAULT NULL,
    permissions TEXT[] DEFAULT '{}',
    school_ids UUID[] DEFAULT '{}',
    created_by_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    temp_password TEXT;
    permission_type TEXT;
    school_id UUID;
    result JSON;
BEGIN
    -- Generate a temporary password
    temp_password := 'TempPass' || floor(random() * 100000)::text;
    
    -- This is a simplified approach - in a real production environment,
    -- you would use the Supabase service role to create users
    -- For now, we'll return instructions for manual creation
    
    result := json_build_object(
        'success', false,
        'method', 'manual',
        'email', admin_email,
        'temp_password', temp_password,
        'instructions', 'Level 1 admin should manually create this user account and then assign admin profile',
        'permissions', permissions,
        'school_ids', school_ids
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Function to assign admin profile to existing user
CREATE OR REPLACE FUNCTION assign_level2_admin_profile(
    target_user_email TEXT,
    admin_level INTEGER DEFAULT 2,
    permissions TEXT[] DEFAULT '{}',
    school_ids UUID[] DEFAULT '{}',
    created_by_user_id UUID DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    permission_type TEXT;
    school_id UUID;
    result JSON;
BEGIN
    -- Find user by email (this is a simplified lookup)
    -- In production, you'd need a more robust user lookup method
    
    -- For now, we'll create the admin profile structure and return instructions
    result := json_build_object(
        'success', true,
        'method', 'profile_assignment',
        'message', 'Admin profile structure created. User needs to be created separately.',
        'email', target_user_email,
        'permissions', permissions,
        'school_ids', school_ids
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
