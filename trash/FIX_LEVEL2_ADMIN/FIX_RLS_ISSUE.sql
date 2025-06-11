-- ===============================================================================
-- QUICK FIX: DISABLE RLS OR ADD PROPER POLICIES
-- This is often the root cause - RLS blocks function inserts
-- ===============================================================================

-- OPTION 1: Temporarily disable RLS to test (DO THIS FIRST)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_assignments DISABLE ROW LEVEL SECURITY;

-- If you have admin_school_assignments table
ALTER TABLE admin_school_assignments DISABLE ROW LEVEL SECURITY;

-- Now test Level 2 admin signup again. If it works, RLS was the issue!

-- OPTION 2: If you need RLS, add these policies
-- Policy for user_profiles - allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Policy for admin_profiles - allow service role (functions) to manage
CREATE POLICY "Service role can manage admin profiles" ON admin_profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Policy for admin_permissions - allow service role to manage
CREATE POLICY "Service role can manage admin permissions" ON admin_permissions
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Policy for admin_assignments - allow service role to manage
CREATE POLICY "Service role can manage admin assignments" ON admin_assignments
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- OPTION 3: Nuclear option - recreate tables without RLS
-- Only do this if Options 1 and 2 don't work
