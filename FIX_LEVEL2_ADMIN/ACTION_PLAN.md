-- ===============================================================================
-- IMMEDIATE ACTION PLAN TO FIX LEVEL 2 ADMIN SIGNUP
-- ===============================================================================

## STEP 1: Run the Diagnosis Script
Run `REAL_DIAGNOSIS.sql` in Supabase SQL Editor. This will tell you exactly which part is failing.

## STEP 2: Most Likely Fix - RLS Issue
If the diagnosis shows functions exist but records aren't created, run this:

```sql
-- Disable RLS on all admin-related tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_school_assignments DISABLE ROW LEVEL SECURITY;
```

## STEP 3: Test Again
After disabling RLS, test the Level 2 admin signup process again. It should work now.

## STEP 4: Re-enable RLS with Proper Policies (Optional)
If you need RLS for security, run `FIX_RLS_ISSUE.sql` Option 2 to add proper policies.

## STEP 5: Verify the Fix
Create a new Level 2 admin invitation and complete the signup. Check these tables:
- `user_profiles` - Should have a record with role='DSVI_ADMIN'
- `admin_profiles` - Should have a record with admin_level=2
- `admin_permissions` - Should have permission records (if any were assigned)
- `admin_assignments` - Should have school assignments (if any were assigned)

## Common Issues and Solutions:

1. **RLS Blocking Inserts** (90% of cases)
   - Solution: Disable RLS or add proper policies
   
2. **Missing Tables**
   - Solution: Run `02_CREATE_MISSING_TABLES.sql`
   
3. **Missing Functions**
   - Solution: Run `COMPLETE_FIX.sql`
   
4. **Auth User Not Created**
   - Make sure the Supabase auth signup completes before calling admin functions

## Quick Debug Check:
Run this to see recent signup attempts:
```sql
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as role,
    EXISTS(SELECT 1 FROM user_profiles WHERE id = u.id) as has_user_profile,
    EXISTS(SELECT 1 FROM admin_profiles WHERE user_id = u.id) as has_admin_profile
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
ORDER BY u.created_at DESC
LIMIT 10;
```
