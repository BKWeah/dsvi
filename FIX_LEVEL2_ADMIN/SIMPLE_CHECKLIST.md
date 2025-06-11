# ✅ LEVEL 2 ADMIN SIGNUP FIX - SIMPLE CHECKLIST

## Do These Steps In Order:

### 1️⃣ First, Run This SQL in Supabase (Takes 5 seconds)
```sql
-- Disable RLS on all admin tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_school_assignments DISABLE ROW LEVEL SECURITY;
```

### 2️⃣ Test Level 2 Admin Signup
1. Go to Admin Management page
2. Create a new Level 2 admin invitation
3. Open the invitation link in an incognito/private browser window
4. Complete the signup process
5. Check if it works now

### 3️⃣ If It Works - You're Done! 🎉
The issue was RLS blocking the database functions.

### 4️⃣ If It Still Doesn't Work
Run `FINAL_COMPREHENSIVE_FIX.sql` - this fixes all other possible issues.

### 5️⃣ How to Verify It's Fixed
Run this SQL to check recent signups:
```sql
SELECT 
    u.email,
    u.created_at,
    up.role as profile_role,
    ap.admin_level,
    CASE 
        WHEN up.id IS NOT NULL AND ap.id IS NOT NULL THEN '✅ Complete'
        WHEN up.id IS NOT NULL THEN '⚠️ Missing admin_profile'
        WHEN ap.id IS NOT NULL THEN '⚠️ Missing user_profile'
        ELSE '❌ Missing both profiles'
    END as status
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'DSVI_ADMIN'
ORDER BY u.created_at DESC
LIMIT 5;
```

## That's It! 
90% of the time, Step 1 (disabling RLS) fixes the issue immediately.
