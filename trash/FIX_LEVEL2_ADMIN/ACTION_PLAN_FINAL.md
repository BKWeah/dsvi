# 🚨 FINAL ACTION PLAN - Level 2 Admin Issues

## Issues to Fix:
1. **Duplicate user_profiles entries**
2. **School assignments not created** 
3. **Test script error** (foreign key constraint)

## Step-by-Step Solution:

### 1️⃣ First, Run Diagnostics (1 minute)
Run `DIAGNOSE_SCHOOL_IDS.sql` to check:
- If the school IDs in invitations are valid
- Which admins are missing assignments
- What schools exist in your database

### 2️⃣ Apply the Simple Fix (2 minutes)
Run `SIMPLE_FINAL_FIX.sql` which:
- Cleans up duplicate user_profiles
- Updates the signup function to prevent duplicates
- Ensures school assignments are created

### 3️⃣ Fix the Test Script Error
The error happens because the test uses a fake user ID. To fix the test in the SQL you provided:

Replace this line:
```sql
test_user_id UUID := gen_random_uuid();
```

With:
```sql
test_user_id UUID := auth.uid(); -- Use current user ID
```

Or use an actual user ID from your database:
```sql
test_user_id UUID := (SELECT id FROM auth.users WHERE email = 'admin@dsvi.com' LIMIT 1);
```

### 4️⃣ Verify Everything Works
After applying fixes, check:

```sql
-- Check for duplicates
SELECT email, COUNT(*) FROM user_profiles 
GROUP BY email HAVING COUNT(*) > 1;

-- Check recent Level 2 admins with assignments
SELECT 
    u.email,
    up.name,
    COUNT(DISTINCT aa.school_id) as schools_assigned
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
JOIN admin_profiles ap ON ap.user_id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
WHERE ap.admin_level = 2
GROUP BY u.id, u.email, up.name
ORDER BY u.created_at DESC
LIMIT 10;
```

## Why This Is Happening:

1. **Duplicate Profiles**: The signup process was creating profiles with wrong IDs
2. **No School Assignments**: The school IDs in invitations might be invalid OR the function isn't processing them
3. **Test Error**: Using random UUIDs that don't exist in auth.users table

## Quick Manual Fix:

If you need to manually assign schools to existing Level 2 admins:

```sql
-- Assign school to specific admin
INSERT INTO admin_assignments (admin_user_id, school_id, assigned_by, created_at, is_active)
SELECT 
    u.id,
    s.id,
    u.id,
    NOW(),
    TRUE
FROM auth.users u
CROSS JOIN schools s
WHERE u.email = 'tuesday@afternoon.com'
  AND s.name = 'Your School Name'
ON CONFLICT DO NOTHING;
```

## Testing After Fix:

1. Create a new Level 2 admin invitation
2. **IMPORTANT**: Select actual schools that exist in your database
3. Complete the signup
4. Check all tables - should now have complete data

**Run `SIMPLE_FINAL_FIX.sql` first - it should fix everything!**
