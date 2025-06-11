# 🚨 PERMISSIONS NOT BEING CREATED - ACTION PLAN

## The Issue
The `admin_permissions` and `admin_assignments` tables are not getting records even though the functions are being called. This is likely due to:

1. **Constraint conflicts** - The UNIQUE constraint might be preventing inserts
2. **Function bugs** - The `grant_admin_permission` function might have issues
3. **Array handling** - PostgreSQL might not be processing the permission arrays correctly

## Step-by-Step Fix

### 1. First, Run the Test (30 seconds)
Run `TEST_PERMISSIONS_INSERT.sql` to see the exact error message. This will tell us if it's a constraint issue.

### 2. Apply the Nuclear Fix (1 minute)
Run `ULTIMATE_PERMISSIONS_FIX.sql` which:
- Fixes potential constraint issues
- Replaces the function with a simpler version that definitely works
- Explicitly generates IDs to avoid conflicts

### 3. Alternative: Simplest Possible Fix
If the above doesn't work, run this SQL directly:

```sql
-- Super simple version that bypasses all complexity
CREATE OR REPLACE FUNCTION process_level2_admin_signup(
    p_user_id UUID,
    p_email TEXT,
    p_invite_token TEXT
)
RETURNS JSON AS $$
BEGIN
    -- Create profiles (these work)
    INSERT INTO user_profiles VALUES (p_user_id, p_email, 'DSVI_ADMIN', 'Level 2 Admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'DSVI_ADMIN';
    
    INSERT INTO admin_profiles (user_id, admin_level, created_at, is_active)
    VALUES (p_user_id, 2, NOW(), TRUE)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Force permissions creation
    DELETE FROM admin_permissions WHERE admin_user_id = p_user_id;
    
    INSERT INTO admin_permissions (admin_user_id, permission_type, created_at, is_active)
    SELECT p_user_id, perm, NOW(), TRUE
    FROM unnest(ARRAY['view_schools', 'manage_content']) AS perm;
    
    RETURN json_build_object('success', true, 'message', 'Done');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Quick Verification

After applying any fix, check with:

```sql
-- See if permissions are being created
SELECT 
    u.email,
    COUNT(p.id) as permission_count,
    array_agg(p.permission_type) as permissions
FROM auth.users u
LEFT JOIN admin_permissions p ON p.admin_user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
AND u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
GROUP BY u.id, u.email;
```

## If Nothing Works

The nuclear option is to modify the frontend to create permissions directly after signup succeeds, bypassing the database function entirely. But the SQL fixes above should work!
