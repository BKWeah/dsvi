# 🚨 LEVEL 2 ADMIN SIGNUP DEBUGGING GUIDE

## Issue: User only added to Users table, not supporting tables

The Level 2 admin signup is not creating entries in `user_profiles`, `admin_profiles`, `admin_permissions`, or `admin_assignments` tables.

## Step-by-Step Debugging Process

### STEP 1: Check Database Functions
Run this in Supabase SQL Editor:
```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN (
    'create_level2_admin_complete',
    'debug_create_level2_admin_complete',
    'safe_create_admin_profile', 
    'upsert_user_profile'
) ORDER BY routine_name;
```
**Expected**: All 4 functions should be listed

### STEP 2: Fix user_profiles Table Structure
Run `emergency_fix_user_profiles.sql` to ensure the table works correctly:
```sql
-- This will check and fix the user_profiles table
-- Run the content from emergency_fix_user_profiles.sql
```

### STEP 3: Test Database Functions Manually
Run `debug_level2_admin_creation.sql` to test the functions:
```sql
-- This will test the debug version of the function
-- Check the NOTICES in the output for detailed logging
```

### STEP 4: Add Frontend Debugging
Replace the Level 2 admin signup code in `AuthContext.tsx` with the debug version from `DEBUG_AuthContext_Level2_Signup.js`

### STEP 5: Test the Complete Flow

1. **Create a test invitation** (or use existing)
2. **Open browser console** before starting signup
3. **Complete the signup process**
4. **Check console logs** for detailed debug information

### STEP 6: Analyze the Results

#### If Functions Don't Exist:
- Re-run the migrations: `supabase db push`
- Check for migration errors

#### If Functions Exist But Don't Work:
- Check the NOTICES output from the debug function
- Look for specific error messages

#### If Frontend Doesn't Call Functions:
- Check localStorage for pending invitations
- Verify invite token matches
- Check console for JavaScript errors

#### If Functions Are Called But Fail:
- Check Supabase logs in dashboard
- Look for permission/RLS issues
- Verify function parameters

## Common Issues & Solutions

### Issue 1: user_profiles table missing user_id column
**Solution**: Run `emergency_fix_user_profiles.sql`

### Issue 2: Functions don't exist
**Solution**: Re-run migrations or create functions manually

### Issue 3: localStorage doesn't have invitation
**Solution**: Create new invitation or check invitation creation process

### Issue 4: RLS policies blocking inserts
**Solution**: Temporarily disable RLS for debugging:
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_assignments DISABLE ROW LEVEL SECURITY;
```

### Issue 5: Function parameters mismatch
**Solution**: Check function signatures and parameters in debug logs

## Expected Debug Output

When working correctly, you should see:
```
DEBUG: Starting Level 2 admin creation for user [UUID] with email [email]
DEBUG: Step 1 - Creating admin profile...
DEBUG: Admin profile result: {"success": true, ...}
DEBUG: Step 2 - Creating user profile...
DEBUG: User profile created successfully
DEBUG: Step 3 - Granting permissions...
DEBUG: Step 4 - Assigning schools...
DEBUG: Step 5 - Verifying setup...
```

## Quick Fix Commands

If you want to bypass the signup process temporarily and create a Level 2 admin manually:

```sql
-- Replace with actual user ID from auth.users
SELECT debug_create_level2_admin_complete(
    '[ACTUAL_USER_ID]'::UUID,  -- Get this from auth.users table
    '[USER_EMAIL]',
    '[USER_NAME]',
    '[CREATOR_USER_ID]'::UUID,  -- Any existing admin user ID
    ARRAY['manage_schools', 'view_reports']::TEXT[],
    ARRAY[]::UUID[],  -- Add school IDs if needed
    'Manually created Level 2 admin for testing'
);
```

Follow these steps in order and report what you find at each step!
