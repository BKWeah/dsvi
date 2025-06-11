# 🔍 PERMISSIONS & ASSIGNMENTS NOT CREATED - SOLUTION

## Problem Summary
After disabling RLS:
- ✅ `user_profiles` - Working
- ✅ `admin_profiles` - Working  
- ❌ `admin_permissions` - NOT working
- ❌ `admin_assignments` - NOT working
- ❌ `admin_school_assignments` - NOT working

## Root Cause
The `create_level2_admin_complete` function is being called with permissions `['view_schools', 'manage_content']` but the permissions aren't being inserted. This is likely because:

1. The `grant_admin_permission` function has a bug
2. The UNIQUE constraint on `admin_permissions` might be causing silent failures
3. The array handling in the function might not be working correctly

## Immediate Fix

### Option 1: Quick Fix (Recommended)
Run `QUICK_FIX_PERMISSIONS.sql` which replaces the `process_level2_admin_signup` function with a simpler version that directly inserts permissions.

```sql
-- This will update the function to directly insert permissions
-- avoiding any issues with the grant_admin_permission function
```

### Option 2: Comprehensive Fix
Run `FIX_PERMISSIONS_FUNCTIONS.sql` which:
- Adds debug logging to track what's happening
- Fixes the grant_admin_permission function
- Updates create_level2_admin_complete with better error handling
- Directly inserts permissions if the function calls fail

## How to Apply the Fix

1. **First, run the diagnostic:**
   ```sql
   -- Run DIAGNOSE_PERMISSIONS_ASSIGNMENTS.sql
   -- This will show you exactly where the process is failing
   ```

2. **Apply the quick fix:**
   ```sql
   -- Run QUICK_FIX_PERMISSIONS.sql
   -- This replaces the function with a working version
   ```

3. **Test immediately:**
   - Create a new Level 2 admin
   - Check if permissions are created

## What This Fix Does

The fixed `process_level2_admin_signup` function:
1. Creates the user_profile (✅ already working)
2. Creates the admin_profile (✅ already working)
3. **Directly inserts** default permissions instead of calling grant_admin_permission
4. Uses `ON CONFLICT DO NOTHING` to avoid constraint errors

## Verification Query

After applying the fix and creating a Level 2 admin, run:

```sql
SELECT 
    u.email,
    up.role,
    ap.admin_level,
    COUNT(DISTINCT perm.id) as permission_count,
    array_agg(DISTINCT perm.permission_type) as permissions
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN admin_permissions perm ON perm.admin_user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
GROUP BY u.id, u.email, up.role, ap.admin_level
ORDER BY u.created_at DESC
LIMIT 5;
```

You should see permission_count > 0 for new Level 2 admins!
