# Test Plan for Level 2 Admin Fixes

## Prerequisites
1. Run the SQL migration `fix_level2_admin_issues.sql` in Supabase
2. Ensure the code changes are deployed

## Test Scenarios

### Test 1: Level 2 Admin Signup and Login
1. **As Level 1 Admin**:
   - Navigate to Admin Management
   - Click "Invite Level 2 Admin"
   - Fill in email and select permissions
   - Copy the invitation link

2. **As New User**:
   - Open the invitation link in a new browser/incognito
   - Sign up with the invited email
   - Complete the signup process

3. **Expected Results**:
   - After login, user should see "Level 2" badge in the sidebar
   - Admin level should be correctly set to 2 (not 1 or null)
   - No errors in console about admin level

### Test 2: Schools Page Access
1. **As Level 2 Admin**:
   - Login with Level 2 admin account
   - Navigate to Schools page

2. **Expected Results**:
   - Page loads without flickering
   - No repeated loading states
   - Only assigned schools are visible
   - No "retrying" messages appear

### Test 3: Permission Verification
1. **As Level 2 Admin with CMS_ACCESS permission**:
   - Should see Schools in navigation
   - Should be able to access Schools page

2. **As Level 2 Admin without CMS_ACCESS permission**:
   - Should NOT see Schools in navigation
   - Should see "You don't have permission" message if accessing directly

### Test 4: Edge Cases
1. **Quick Navigation**:
   - Login as Level 2 admin
   - Immediately navigate to Schools
   - Should not see flickering or loading loops

2. **Page Refresh**:
   - While on Schools page, refresh the browser
   - Admin level should persist correctly
   - No flickering should occur

## Verification Steps
1. Check browser console for any errors
2. Verify localStorage has `activatedLevel2Admins` entry
3. Check network tab for repeated RPC calls
4. Verify admin_profiles table has correct entry

## Common Issues and Solutions
- If admin still shows as Level 1: Clear localStorage and re-login
- If Schools page still flickers: Check if migration was applied
- If permissions not working: Verify admin_permissions table entries
