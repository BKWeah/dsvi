# Phase 1 Database Migration Guide

## 🚀 Quick Setup Instructions

### 1. Apply Database Migration
```bash
# Navigate to your project directory
cd /path/to/dsvi

# Apply the new migration
supabase db push

# OR if using direct SQL:
# Copy the contents of supabase/migrations/20250530000000_phase1_admin_assignments_subscriptions.sql
# and run it in your Supabase SQL editor
```

### 2. Update Environment (if needed)
No new environment variables required for Phase 1.

### 3. Test the Implementation
1. **Login as DSVI Admin** → Navigate to `/dsvi-admin` (should show new dashboard)
2. **Create a New School** → Should include subscription fields
3. **Assign School Admin** → Go to School Settings → Assignments tab
4. **Login as School Admin** → Should only see assigned schools
5. **Check Activity Logs** → Dashboard should show recent activities

### 4. Verify Database Tables
Run these queries in Supabase to verify tables were created:

```sql
-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_school_assignments', 'activity_logs');

-- Check if subscription fields were added to schools
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('package_type', 'subscription_start', 'subscription_end', 'subscription_status');

-- Test activity logging function
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
```

### 5. Common Issues & Solutions

**Issue: Migration fails due to RLS policies**
```sql
-- If you encounter RLS conflicts, temporarily disable RLS:
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
-- Run migration
-- Then re-enable with the new policies
```

**Issue: Activity logging not working**
- Ensure user is authenticated when testing
- Check browser console for any JavaScript errors
- Verify the `log_activity` function was created successfully

**Issue: School assignments not showing**
- Check RLS policies are applied correctly
- Ensure the School Admin has the correct role in auth.users.user_metadata
- Verify assignments exist in the admin_school_assignments table

### 6. Post-Migration Checklist
- [ ] Dashboard shows statistics correctly
- [ ] School creation includes subscription fields  
- [ ] School assignments work for DSVI Admins
- [ ] School Admins see only assigned schools
- [ ] Activity logging captures all actions
- [ ] Mobile navigation includes dashboard
- [ ] Subscription status badges display correctly

### 7. Next Steps (Phase 2)
1. Set up email service (SendGrid/AWS SES)
2. Implement messaging templates
3. Add notification system
4. Create automated reminder workflows

## 🆘 Support
If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection and authentication
3. Ensure all migrations are applied correctly
4. Test with different user roles

The implementation is now ready for Phase 2 development!