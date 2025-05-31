-- ===============================================================================
-- DSVI Platform - Phase 1: Admin Assignments & Subscriptions
-- Date: 2025-05-30
-- Purpose: Implement school assignments, subscription tracking, and activity logs
-- ===============================================================================

-- ===============================================================================
-- 1. ADMIN SCHOOL ASSIGNMENTS TABLE
-- ===============================================================================
CREATE TABLE IF NOT EXISTS admin_school_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"can_edit": true, "can_approve": false, "can_manage_content": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_admin_id, school_id)
);

-- Add RLS policies for admin_school_assignments
ALTER TABLE admin_school_assignments ENABLE ROW LEVEL SECURITY;

-- DSVI Admins can manage all assignments
DROP POLICY IF EXISTS "assignments_dsvi_admin_all" ON admin_school_assignments;
CREATE POLICY "assignments_dsvi_admin_all" ON admin_school_assignments
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- School Admins can view their own assignments
DROP POLICY IF EXISTS "assignments_school_admin_read" ON admin_school_assignments;
CREATE POLICY "assignments_school_admin_read" ON admin_school_assignments
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_admin_id = auth.uid()
);

-- ===============================================================================
-- 2. ADD SUBSCRIPTION FIELDS TO SCHOOLS TABLE
-- ===============================================================================
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'standard' CHECK (package_type IN ('standard', 'advanced')),
ADD COLUMN IF NOT EXISTS subscription_start DATE,
ADD COLUMN IF NOT EXISTS subscription_end DATE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expiring', 'inactive', 'pending')),
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE;

-- ===============================================================================
-- 3. ACTIVITY LOGS TABLE
-- ===============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- DSVI Admins can view all logs
CREATE POLICY "logs_dsvi_admin_all" ON activity_logs
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

-- School Admins can view logs for their assigned schools only
CREATE POLICY "logs_school_admin_assigned" ON activity_logs
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT school_id FROM admin_school_assignments 
    WHERE school_admin_id = auth.uid()
  )
);

-- All authenticated users can insert their own logs
CREATE POLICY "logs_insert_own" ON activity_logs
FOR INSERT WITH CHECK (user_id = auth.uid());

-- ===============================================================================
-- 4. UPDATE EXISTING POLICIES FOR SCHOOL ASSIGNMENTS
-- ===============================================================================

-- Update schools policies to respect assignments
DROP POLICY IF EXISTS "schools_school_admin_assigned" ON schools;
CREATE POLICY "schools_school_admin_assigned" ON schools 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  (
    -- Either they are the assigned admin
    admin_user_id = auth.uid() OR
    -- Or they have an assignment to this school
    id IN (
      SELECT school_id FROM admin_school_assignments 
      WHERE school_admin_id = auth.uid()
    )
  )
);

-- Update pages policies to respect assignments  
DROP POLICY IF EXISTS "pages_school_admin_assigned" ON pages;
CREATE POLICY "pages_school_admin_assigned" ON pages 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT school_id FROM admin_school_assignments 
    WHERE school_admin_id = auth.uid()
    UNION
    SELECT id FROM schools WHERE admin_user_id = auth.uid()
  )
);

-- ===============================================================================
-- 5. HELPER FUNCTIONS
-- ===============================================================================

-- Function to automatically update subscription status based on dates
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate status based on subscription_end date
  IF NEW.subscription_end IS NULL THEN
    NEW.subscription_status := 'pending';
  ELSIF NEW.subscription_end < CURRENT_DATE THEN
    NEW.subscription_status := 'inactive';
  ELSIF NEW.subscription_end <= CURRENT_DATE + INTERVAL '14 days' THEN
    NEW.subscription_status := 'expiring';
  ELSE
    NEW.subscription_status := 'active';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update subscription status automatically
DROP TRIGGER IF EXISTS update_school_subscription_status ON schools;
CREATE TRIGGER update_school_subscription_status
  BEFORE INSERT OR UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_school_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, school_id, action, details)
  VALUES (p_user_id, p_school_id, p_action, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ===============================================================================
CREATE INDEX IF NOT EXISTS idx_admin_school_assignments_school_admin ON admin_school_assignments(school_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_school_assignments_school ON admin_school_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_school ON activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schools_subscription_status ON schools(subscription_status);
CREATE INDEX IF NOT EXISTS idx_schools_subscription_end ON schools(subscription_end);

-- ===============================================================================
-- 7. SAMPLE DATA FOR TESTING (Optional - only run in development)
-- ===============================================================================

-- Update existing schools with subscription data
UPDATE schools 
SET 
  package_type = 'standard',
  subscription_start = CURRENT_DATE - INTERVAL '30 days',
  subscription_end = CURRENT_DATE + INTERVAL '335 days',
  subscription_status = 'active'
WHERE subscription_start IS NULL;

-- ===============================================================================
-- MIGRATION COMPLETE
-- ===============================================================================
