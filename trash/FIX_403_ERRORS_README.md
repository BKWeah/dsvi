# Fixing 403 Forbidden Errors for user_profiles and activity_logs

## Problem
You're getting "permission denied" errors (403 Forbidden) when trying to access the `user_profiles` and `activity_logs` tables in Supabase.

## Cause
Row Level Security (RLS) is enabled on these tables but proper policies haven't been created, blocking all access.

## Quick Fix (Development)
Run `quick_fix_403.sql` in your Supabase SQL Editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `quick_fix_403.sql`
4. Click "Run"

This will disable RLS on both tables, making them accessible.

## Production Fix (With Security)
If you need RLS enabled for production, run `fix_rls_403_errors.sql` instead. This script:
1. Removes all existing policies
2. Creates permissive policies allowing authenticated users to access the tables
3. Verifies the fix

## Alternative: Using Supabase Dashboard
1. Go to Table Editor in Supabase
2. Click on `user_profiles` table
3. Click "RLS disabled/enabled" toggle to disable it
4. Repeat for `activity_logs` table

## Testing
After applying the fix, click "Test Database Connections" in your admin dashboard to verify everything works.

## Long-term Solution
For production, implement proper RLS policies based on your security requirements:
- DSVI admins should see all data
- School admins should see only their school's data
- Regular users should see only their own data