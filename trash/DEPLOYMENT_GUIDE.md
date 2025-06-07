# DSVI Admin Levels Implementation - DEPLOYMENT GUIDE

## ⚠️ CRITICAL: Follow these steps in order to avoid breaking the website

### PHASE 1: Database Migration (SAFE - No breaking changes)
1. **Apply the database migration**:
   ```bash
   # Navigate to supabase directory
   cd supabase
   
   # Apply the migration
   supabase db push
   
   # Or manually run the migration file in Supabase dashboard
   ```

2. **Verify migration success**:
   - Check that new tables exist: `admin_profiles`, `admin_permissions`, `admin_assignments`
   - Verify new functions are created: `get_admin_level`, `has_admin_permission`, etc.

### PHASE 2: Code Deployment (SAFE - Backward compatible)
1. **Deploy the new code**:
   - All existing functionality remains unchanged
   - Existing DSVI admins automatically become Level 1 admins on login
   - No immediate UI changes for existing users

2. **Test with existing DSVI admin account**:
   - Login with existing DSVI admin credentials
   - Navigate to `/dsvi-admin/admin-test` to run system tests
   - Verify admin level shows as "Level 1 (Super Admin)"
   - Confirm all existing navigation and features work

### PHASE 3: Create First Level 2 Admin (SAFE)
1. **Access Admin Management**:
   - Navigate to `/dsvi-admin/admin-management`
   - Only Level 1 admins can access this page

2. **Create Level 2 Admin**:
   - Click "Create Level 2 Admin"
   - Fill in email, name, and notes
   - Select specific permissions (start with minimal set)
   - Assign to specific schools
   - Click "Create Admin"

3. **Test Level 2 Admin**:
   - Login with new Level 2 admin credentials
   - Verify limited access based on assigned permissions
   - Confirm they can only see assigned schools

### PHASE 4: Gradual Permission Assignment
1. **Start with content management permissions**:
   - `content_management`
   - `cms_access`
   - `announcements`

2. **Add communication permissions as needed**:
   - `messaging`
   - `message_templates`

3. **Grant monitoring permissions**:
   - `subscription_view`
   - `activity_logs`

### TESTING CHECKLIST

#### ✅ Database Tests
- [ ] Migration applied successfully
- [ ] All functions created without errors
- [ ] Test RPC calls work: `SELECT get_admin_level('user-id-here');`

#### ✅ Level 1 Admin Tests (Existing DSVI Admins)
- [ ] Can login normally
- [ ] Shows "Level 1 (Super Admin)" badge
- [ ] Can access all existing features
- [ ] Can access "Admin Management" page
- [ ] Can create Level 2 admins
- [ ] All restricted features still accessible

#### ✅ Level 2 Admin Tests (New)
- [ ] Can login with Level 2 credentials
- [ ] Shows "Level 2 (Assigned Staff)" badge
- [ ] Cannot access admin management
- [ ] Cannot access school requests (if not granted permission)
- [ ] Can only see assigned schools in schools list
- [ ] Permissions properly enforced

#### ✅ Permission System Tests
- [ ] Level 2 admin cannot access billing/subscriptions without permission
- [ ] Level 2 admin cannot invite school admins
- [ ] Level 2 admin cannot approve school requests
- [ ] Permission changes take effect immediately

## ROLLBACK PLAN (If needed)

### Immediate Rollback
1. **Revert code changes**:
   - Revert to previous version of the application
   - Original functionality will be restored

2. **Database rollback** (if necessary):
   ```sql
   -- Only if you need to remove the new tables (NOT recommended unless critical)
   DROP TABLE IF EXISTS admin_assignments;
   DROP TABLE IF EXISTS admin_permissions;  
   DROP TABLE IF EXISTS admin_profiles;
   
   -- Remove functions
   DROP FUNCTION IF EXISTS get_admin_level(UUID);
   DROP FUNCTION IF EXISTS has_admin_permission(UUID, TEXT, UUID);
   -- ... etc for other functions
   ```

### Partial Rollback
- Keep database changes but disable admin level features
- Set environment variable: `DISABLE_ADMIN_LEVELS=true`
- This maintains data while reverting to original behavior

## SAFETY FEATURES BUILT-IN

1. **Backward Compatibility**:
   - All existing DSVI admins become Level 1 automatically
   - Original `ProtectedRoute` component still works
   - All existing navigation preserved for Level 1 admins

2. **Non-Breaking Updates**:
   - Admin level detection in `AuthContext` 
   - Enhanced but compatible protection in routes
   - Graceful fallbacks for missing permissions

3. **Database Safety**:
   - All new tables have proper foreign keys and constraints
   - Functions use `SECURITY DEFINER` for controlled access
   - RLS policies can be added later if needed

## POST-DEPLOYMENT STEPS

1. **Monitor logs** for any permission-related errors
2. **Train Level 1 admins** on the new admin management features
3. **Document permission assignments** for different staff roles
4. **Gradually transition** responsibilities to Level 2 admins
5. **Review and adjust** permissions based on actual usage

## SUPPORT CONTACTS
- If issues arise during deployment, check the test page: `/dsvi-admin/admin-test`
- Review browser console for permission-related errors
- Check Supabase logs for database function errors

## SUCCESS CRITERIA
✅ All existing DSVI admins can login and access all features
✅ New Level 2 admins can be created and assigned permissions
✅ Permission system properly restricts access
✅ No breaking changes to existing functionality
✅ School assignments work correctly for Level 2 admins
