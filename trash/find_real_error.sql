-- Debug: Find the real error in create_admin_from_invitation

-- First, let's manually try the same INSERT that the function does
DO $$
DECLARE
    invitation_record RECORD;
    test_user_id UUID := gen_random_uuid();
    admin_id UUID;
    invitation_token TEXT;
BEGIN
    -- Get invitation data
    SELECT invite_token INTO invitation_token 
    FROM pending_admin_invitations 
    WHERE email = 'test.level2@example.com' AND is_used = false
    LIMIT 1;
    
    SELECT * INTO invitation_record
    FROM pending_admin_invitations
    WHERE invite_token = invitation_token
    AND expires_at > NOW()
    AND is_used = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No valid invitation found';
    END IF;
    
    RAISE NOTICE 'Invitation found: %, %, %, %, %, %', 
        invitation_record.email, 
        invitation_record.name,
        invitation_record.admin_level,
        invitation_record.permissions,
        invitation_record.school_ids,
        invitation_record.created_by;
    
    -- Try the INSERT manually to see the real error
    BEGIN
        INSERT INTO dsvi_admins (
            user_id, email, name, admin_level, permissions, school_ids,
            notes, created_by, invite_token, signup_completed_at
        ) VALUES (
            test_user_id, 
            invitation_record.email, 
            invitation_record.name,
            invitation_record.admin_level, 
            invitation_record.permissions,
            invitation_record.school_ids, 
            invitation_record.notes,
            invitation_record.created_by, 
            invitation_token, 
            NOW()
        ) RETURNING id INTO admin_id;
        
        RAISE NOTICE 'SUCCESS: Admin created with ID: %', admin_id;
        
        -- Clean up
        DELETE FROM dsvi_admins WHERE id = admin_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INSERT FAILED - Real error: %', SQLERRM;
        RAISE NOTICE 'SQL State: %', SQLSTATE;
        RAISE NOTICE 'Error Detail: %', SQLERRM;
    END;
END $$;
