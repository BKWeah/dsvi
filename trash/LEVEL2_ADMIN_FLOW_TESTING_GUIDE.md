# 🧪 COMPLETE LEVEL 2 ADMIN FLOW TESTING GUIDE

## Overview
This guide will help you comprehensively test the complete Level 2 admin invitation and signup flow to ensure everything works with the new consolidated `dsvi_admin` table.

---

## 🔧 Prerequisites
1. Application running on `http://localhost:8081`
2. Level 1 admin account access
3. Database access (optional for verification)

---

## 📋 STEP-BY-STEP TESTING

### **STEP 1: Level 1 Admin Creates Invitation** ✅

**Action:**
1. Login as Level 1 admin
2. Go to Admin Management page (`/dsvi-admin/admin-management`)
3. Click "Create Level 2 Admin"
4. Fill out form:
   - **Email:** `test.level2@example.com`
   - **Name:** `Test Level 2 Admin`
   - **Permissions:** Select 2-3 permissions (e.g., VIEW_SCHOOLS, MANAGE_CONTENT)
   - **Schools:** Select 1-2 schools
   - **Notes:** `Test admin for flow verification`
5. Click "Create Invitation"

**Expected Result:**
- ✅ Success dialog appears
- ✅ Signup link is displayed and copied to clipboard
- ✅ Link format: `http://localhost:8081/level2-admin-signup?token=...&eh=...&pwd=...&name=...`
- ✅ Console shows: `✅ Database invitation created successfully`

**Verification:**
```sql
-- Check invitation was saved
SELECT email, name, permissions, school_ids, is_used, expires_at 
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';
```

---

### **STEP 2: Check Pending Invitations List** ✅

**Action:**
1. On Admin Management page, scroll to "Pending Invitations" section
2. Click "Refresh" if needed

**Expected Result:**
- ✅ Test invitation appears in the list
- ✅ Shows correct email (obscured), name, permissions count, schools count
- ✅ Status shows "Pending" with expiry date
- ✅ Copy, Email, and External Link buttons work

---

### **STEP 3: Level 2 Admin Signup Process** ✅

**Action:**
1. Open the signup link in a new browser window/incognito
2. Page should load showing invitation details
3. Confirm email: Enter `test.level2@example.com`
4. Set password: Use the pre-filled password or create new one (min 6 chars)
5. Confirm password
6. Click "Create Level 2 Admin Account"

**Expected Result:**
- ✅ Email confirmation works (green checkmark when correct)
- ✅ Password validation works
- ✅ Success message: "Account Created Successfully!"
- ✅ Redirected to login page
- ✅ Console shows:
  ```
  ✅ Auth user created: [user-id]
  ✅ Admin record created successfully: [admin-id]
  ```

**Verification:**
```sql
-- Check admin was created in dsvi_admins
SELECT user_id, email, name, admin_level, permissions, school_ids, 
       is_active, signup_completed_at
FROM dsvi_admins 
WHERE email = 'test.level2@example.com';

-- Check invitation was marked as used
SELECT is_used, used_at, used_by 
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com';
```

---

### **STEP 4: Level 2 Admin Login** ✅

**Action:**
1. Go to login page
2. Login with:
   - **Email:** `test.level2@example.com`
   - **Password:** [password from signup]

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to Level 2 admin dashboard
- ✅ Console shows:
  ```
  🔄 Fetching admin data using consolidated dsvi_admin table for user: [user-id]
  ✅ Admin level fetched: 2
  ✅ Admin profile fetched from consolidated table: [admin-data]
  ```
- ✅ No 406 errors for `admin_profiles` table

---

### **STEP 5: Verify Level 2 Admin Functionality** ✅

**Action:**
1. Check Level 2 admin can access their assigned features
2. Navigate to different pages (Schools, Dashboard, etc.)
3. Verify permissions work correctly
4. Check school access restrictions

**Expected Result:**
- ✅ Only assigned schools visible
- ✅ Only permitted actions available
- ✅ Restricted functions (like creating other admins) not accessible
- ✅ Admin data loads correctly

---

### **STEP 6: Level 1 Admin Views New Level 2 Admin** ✅

**Action:**
1. Login as Level 1 admin
2. Go to Admin Management page
3. Check the Level 2 admins list

**Expected Result:**
- ✅ New Level 2 admin appears in the list
- ✅ Shows correct permissions and school counts
- ✅ View and Edit buttons work
- ✅ Last login timestamp updated

---

## 🔍 KEY VERIFICATION POINTS

### **Database Flow:**
1. **pending_admin_invitations** → stores invitation details
2. **signup process** → transfers data to **dsvi_admins**
3. **invitation marked as used** → prevents reuse

### **Data Mapping:**
- ✅ `permissions` array copied correctly
- ✅ `school_ids` array copied correctly  
- ✅ `admin_level` set to 2
- ✅ `user_id` linked to auth.users
- ✅ `signup_completed_at` timestamp set
- ✅ `created_by` tracks who created invitation

### **Frontend Integration:**
- ✅ `useAdmin` hook uses new consolidated functions
- ✅ Admin management uses `list_level2_admins()`
- ✅ Invitation creation uses `create_admin_invitation()`
- ✅ Signup uses `create_admin_from_invitation()`

---

## 🐛 TROUBLESHOOTING

### **Common Issues:**

**1. 406 Errors**
- Check `useAdmin.ts` uses `get_admin_level_new()` not `get_admin_level()`
- Verify no components query `admin_profiles` table

**2. Invitation Not Found**
- Check token encoding/decoding in signup process
- Verify `get_invitation_by_token()` function exists

**3. Admin Not Created**
- Check `create_admin_from_invitation()` function exists
- Verify invitation email matches signup email exactly

**4. Permission Issues**
- Verify `has_admin_permission_new()` function exists
- Check admin data loading in `useAdmin` hook

---

## ✅ SUCCESS CRITERIA

When everything works correctly:

1. ✅ Level 1 admin creates invitation → stored in `pending_admin_invitations`
2. ✅ Signup link generated with proper format
3. ✅ Level 2 admin signs up → data transferred to `dsvi_admins`
4. ✅ Original invitation marked as used
5. ✅ Level 2 admin can login and access assigned features
6. ✅ All permissions and school assignments preserved
7. ✅ No 406 database errors in console
8. ✅ Admin management shows new Level 2 admin

---

## 🎯 FINAL VALIDATION

Run this SQL to verify the complete flow:

```sql
-- Verify the complete flow worked
SELECT 
    'INVITATION CREATED' as step,
    email, name, permissions, school_ids, 
    is_used, created_at, expires_at
FROM pending_admin_invitations 
WHERE email = 'test.level2@example.com'

UNION ALL

SELECT 
    'ADMIN CREATED' as step,
    email, name, permissions::text, school_ids::text, 
    is_active::text, created_at::text, signup_completed_at::text
FROM dsvi_admins 
WHERE email = 'test.level2@example.com';
```

If both records exist with `is_used = true` and `is_active = true`, the flow is working perfectly! 🎉
