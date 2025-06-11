## LEVEL 2 ADMIN SIGNUP FIX - STEP BY STEP GUIDE

### THE PROBLEM:
When Level 2 admins sign up from invitations, the admin_profiles, admin_permissions, and admin_assignments records are NOT being created because the `process_level2_admin_signup` database function is missing.

### THE SOLUTION:

#### STEP 1: Apply the Critical Fix (URGENT)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of: `URGENT_FIX_MISSING_FUNCTION.sql`
4. Click "RUN" to execute the SQL

#### STEP 2: Test the Fix
1. Start your development server
2. Navigate to Admin Management page
3. Create a Level 2 admin invitation
4. Try the signup process with the invitation link
5. Check if admin_profiles, admin_permissions, and admin_assignments are created

#### STEP 3: If Step 1 Fails (Fallback)
If you get errors about `create_level2_admin_complete` not existing:
1. In Supabase SQL Editor, run: `FALLBACK_SIMPLE_FUNCTION.sql`
2. Then run these commands to switch functions:
```sql
ALTER FUNCTION process_level2_admin_signup RENAME TO process_level2_admin_signup_backup;
ALTER FUNCTION process_level2_admin_signup_simple RENAME TO process_level2_admin_signup;
```

#### STEP 4: Verify the Fix
After applying either fix, test by:
1. Creating a new Level 2 admin invitation
2. Completing the signup process
3. Checking these tables have new records:
   - `admin_profiles` (should have admin_level = 2)
   - `user_profiles` (should have role = 'DSVI_ADMIN')

### FILES TO USE:
- `URGENT_FIX_MISSING_FUNCTION.sql` - Primary fix
- `FALLBACK_SIMPLE_FUNCTION.sql` - If primary fix fails

### ROOT CAUSE:
The AuthContext calls `process_level2_admin_signup` but this function was never deployed to your database, so Level 2 admin records were never created during signup.
