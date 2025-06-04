# Admin Level Fix - Updated Testing Guide

## Problem Fixed
Level 2 admin signups were being overridden and displayed as "Level 1 (Super Admin)" due to multiple auto-upgrade functions creating Level 1 profiles.

## Applied Fixes

### 1. Enhanced Signup Process (`AuthContext.tsx`)
- **Added retry logic**: Admin profile creation now retries up to 3 times on failure
- **Added verification**: Confirms admin level was created correctly after signup
- **Enhanced logging**: Detailed console output with emojis for easy debugging
- **Increased delays**: More time for database operations to complete

### 2. Fixed Schools Page Flickering (`SchoolsPage.tsx`)
- **Added admin loading checks**: Page waits for admin level before rendering
- **Added permission validation**: Checks access before showing content
- **Added proper error states**: Shows helpful messages when admin level is null
- **Prevents race conditions**: No more flickering between states

### 3. Database Migration (`20250604100000_fix_admin_level_auto_creation.sql`)
- **Removed auto-creation**: `upsert_user_profile` no longer auto-creates Level 1 profiles
- **Admin profiles**: Now only created explicitly through invitation system

### 4. Debug Tools
- **Admin Debug Utility**: Real-time admin level checking and verification
- **Admin Migration Utility**: Manual tool to migrate existing DSVI admins to Level 1
- **Database Test Scripts**: SQL queries to verify database state

## Testing Steps

### Test 1: Level 2 Admin Signup (Primary Test)
1. **Go to**: Admin Management page → Create Level 2 Admin invitation
2. **Sign up**: Using the invitation link with a new email
3. **Watch Console**: Look for detailed emoji-coded progress messages:
   ```
   🔄 Processing Level 2 admin signup with invite token: [token]
   ✅ Found matching Level 2 admin invitation: [data]
   🚀 Creating Level 2 admin profile...
   ✅ Level 2 admin profile created successfully: [data]
   ✅ Granted permission: [permission]
   ✅ Assigned to school: [schoolId]
   🎉 Level 2 admin setup completed successfully
   ✅ Admin level verification successful: Level 2
   🔄 Refreshing admin level in AuthContext...
   ```
4. **Login**: After signup, dashboard should show "Level 2 (Assigned Staff)" with shield icon
5. **Verify Access**: Schools page should only show assigned schools (no flickering)

### Test 2: Debug and Verification
1. **Use Admin Debug Utility**: On Admin Management page, run debug check
2. **Check Database**: Raw admin level should match hook admin level
3. **Verify Permissions**: Should see granted permissions and school assignments

### Test 3: Existing Admin Migration
1. **Run Migration Utility**: If you have existing DSVI admins without profiles
2. **Verify Migration**: Check that they become Level 1 admins after migration

## Debug Console Messages
**Successful Level 2 Signup Should Show:**
- 🔄 = Processing step
- ✅ = Success
- 🚀 = Starting critical operation
- 🎉 = Complete success
- ❌ = Error (shouldn't appear in successful signup)

**Common Error Messages:**
- ❌ Email mismatch in Level 2 admin signup
- ❌ Invitation has expired
- ❌ Failed to create Level 2 admin profile
- ❌ Admin level verification failed

## Troubleshooting

### If Level 2 Admin Still Shows as Level 1:
1. **Check Console**: Look for ❌ error messages during signup
2. **Use Debug Utility**: Compare database admin level vs hook admin level
3. **Check Database**: Run `TEST_ADMIN_FUNCTIONS.sql` queries
4. **Retry**: Use "Refresh Admin Data" button in debug utility

### If Schools Page Flickers:
1. **Check Admin Level**: Should not be null
2. **Check Permissions**: User needs CMS_ACCESS permission
3. **Wait for Loading**: Page should show "Loading admin permissions..." first

### If Signup Fails Completely:
1. **Check Invitation**: Verify token hasn't expired and email matches
2. **Check Database**: Ensure migration was applied successfully
3. **Check Network**: Database operations might be timing out

## Database Verification
Run these queries in Supabase SQL editor:
```sql
-- Check all DSVI admin users and their levels
SELECT 
    au.email,
    COALESCE(ap.admin_level, 0) as admin_level,
    ap.notes
FROM auth.users au
LEFT JOIN admin_profiles ap ON au.id = ap.user_id
WHERE au.raw_user_meta_data->>'role' = 'DSVI_ADMIN';
```

## Success Indicators
- ✅ Level 2 admin signup completes without errors
- ✅ Dashboard shows "Level 2 (Assigned Staff)" with shield icon
- ✅ Schools page loads without flickering
- ✅ Debug utility shows matching database and hook admin levels
- ✅ Console shows successful emoji-coded progress messages

