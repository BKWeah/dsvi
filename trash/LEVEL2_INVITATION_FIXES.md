# Level 2 Admin Invitation System - CRITICAL FIX

## 🎯 ROOT CAUSE IDENTIFIED AND FIXED

You were absolutely right! The admin level was being silently overridden by the `upsert_user_profile` function.

### What Was Happening:
1. **Step 1**: User signs up with Level 2 invitation 
2. **Step 2**: `upsert_user_profile` gets called first → **Creates Level 1 admin record**
3. **Step 3**: `create_admin_from_invitation` tries to create Level 2 admin → **FAILS due to UNIQUE constraint**
4. **Result**: User ends up with Level 1 admin instead of Level 2

### 🔧 FIXES APPLIED:

#### 1. **Updated `create_admin_from_invitation` Function**
- Now handles existing admin records by **UPDATING** them instead of trying to insert
- Explicitly sets admin_level to the invitation's level (2) 
- Properly transfers all invitation data (permissions, schools, created_by, etc.)

#### 2. **Updated `upsert_user_profile` Function** 
- Added `p_skip_admin_creation` parameter
- Prevents auto Level 1 admin creation for users with invite tokens

#### 3. **Updated AuthContext**
- Passes `p_skip_admin_creation: true` for DSVI_ADMIN users with invite tokens
- Prevents the conflict at the source

## 📁 Files Modified:
1. `supabase/migrations/20250613000001_fix_admin_override_issue.sql`
2. `supabase/migrations/20250613000002_update_upsert_user_profile.sql`  
3. `src/contexts/AuthContext.tsx`

## ✅ Testing Instructions:
1. Create a Level 2 invitation 
2. Sign up using the invitation link
3. Check admin record: `SELECT * FROM dsvi_admins WHERE email = 'test@email.com';`
4. Verify: admin_level = 2, permissions populated, schools populated

The silent override issue is now fixed! 🎉
