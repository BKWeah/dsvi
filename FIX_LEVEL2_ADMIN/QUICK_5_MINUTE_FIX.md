# ✅ STEP-BY-STEP FIX (5 Minutes)

## Do These Steps In Order:

### 1️⃣ Run This SQL First (30 seconds)
```sql
-- Disable RLS and grant permissions
ALTER TABLE pending_admin_invitations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON pending_admin_invitations TO authenticated;
```

### 2️⃣ Test Invitation Creation (1 minute)
1. Go to Admin Management page
2. Create a Level 2 admin invitation with some schools selected
3. Run this SQL to check:
```sql
SELECT * FROM pending_admin_invitations 
ORDER BY created_at DESC LIMIT 1;
```

### 3️⃣ If No Record Found, Run This Fix (2 minutes)
Run the complete fix: `COMPLETE_INVITATION_AND_ASSIGNMENT_FIX.sql`

### 4️⃣ Test Complete Flow (2 minutes)
1. Create new invitation with schools
2. Use the signup link
3. Check all tables:
```sql
-- Check latest Level 2 admin
SELECT 
    u.email,
    up.name,
    COUNT(DISTINCT perm.id) as permissions,
    COUNT(DISTINCT aa.id) as schools
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
LEFT JOIN admin_permissions perm ON perm.admin_user_id = u.id
LEFT JOIN admin_assignments aa ON aa.admin_user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '10 minutes'
GROUP BY u.id, u.email, up.name;
```

## That's It!

The main issue is that `pending_admin_invitations` has RLS enabled blocking saves. 
Once you disable RLS (Step 1), everything should work!

## Files Created:
- `DEBUG_INVITATION_SAVE.sql` - Find why invitations aren't saving
- `COMPLETE_INVITATION_AND_ASSIGNMENT_FIX.sql` - Complete fix for all issues
- `QUICK_VERIFICATION.sql` - Verify everything works
- `URGENT_COMPLETE_FIX.md` - Detailed explanation

**Start with Step 1 - it usually fixes everything!**
