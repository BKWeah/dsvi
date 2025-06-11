# 🚨 URGENT FIX: Level 2 Admin Signup Not Working

## PROBLEM
User signup only creates entry in `auth.users` but not in supporting tables (`user_profiles`, `admin_profiles`, etc.)

## QUICK DIAGNOSIS & FIX

### STEP 1: Run Quick Test
Copy and run `quick_test_level2_admin.sql` in Supabase SQL Editor
- This will tell us exactly what's missing

### STEP 2: Fix Table Structure  
Copy and run `emergency_fix_user_profiles.sql` in Supabase SQL Editor
- This fixes the `user_profiles` table structure

### STEP 3: Test Functions
Copy and run `debug_level2_admin_creation.sql` in Supabase SQL Editor
- This creates a debug function and tests it

### STEP 4: Add Frontend Debugging
Replace the Level 2 admin signup code in `src/contexts/AuthContext.tsx` with the code from `DEBUG_AuthContext_Level2_Signup.js`

### STEP 5: Test Complete Flow
1. Create a Level 2 admin invitation
2. Open browser console (F12) 
3. Use the signup link
4. Watch console for debug messages

## FILES TO RUN (IN ORDER):
1. `quick_test_level2_admin.sql` - Diagnosis
2. `emergency_fix_user_profiles.sql` - Fix table
3. `debug_level2_admin_creation.sql` - Debug function
4. Replace AuthContext code with debug version
5. Test the signup flow

## EXPECTED RESULT:
After these fixes, Level 2 admin signup should create entries in:
- ✅ `auth.users` (already working)
- ✅ `user_profiles` 
- ✅ `admin_profiles` (with level = 2)
- ✅ `admin_permissions` 
- ✅ `admin_assignments`

## IF STILL NOT WORKING:
Run the detailed debugging guide in `LEVEL2_ADMIN_DEBUG_GUIDE.md`

**Start with Step 1 and report what the quick test shows!**
