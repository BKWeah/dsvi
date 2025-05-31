-- ===============================================================================
-- DSVI Platform - Subscription Management Migration
-- Date: 2025-05-30
-- Purpose: Add comprehensive subscription management and package tracking
-- ===============================================================================

-- Add subscription fields to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'standard' CHECK (package_type IN ('standard', 'advanced'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_start DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_end DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expiring', 'inactive', 'trial'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_notes TEXT;

-- Create subscription_history table for tracking changes
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'created', 'renewed', 'expired', 'upgraded', 'downgraded', 'suspended'
  previous_package TEXT,
  new_package TEXT,
  previous_end_date DATE,
  new_end_date DATE,
  amount DECIMAL(10,2),
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_reminders table for tracking notification history
CREATE TABLE IF NOT EXISTS subscription_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL, -- 'expiry_warning', 'expired', 'renewal_success', 'payment_overdue'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_by UUID REFERENCES auth.users(id),
  message_content TEXT,
  delivery_method TEXT DEFAULT 'email' -- 'email', 'in_app', 'sms'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_subscription_status ON schools(subscription_status);
CREATE INDEX IF NOT EXISTS idx_schools_subscription_end ON schools(subscription_end);
CREATE INDEX IF NOT EXISTS idx_schools_package_type ON schools(package_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_school ON subscription_history(school_id);
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_school ON subscription_reminders(school_id);

-- Create function to automatically update subscription status based on dates
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if subscription_end is set
  IF NEW.subscription_end IS NOT NULL THEN
    -- Calculate days until expiry
    DECLARE
      days_until_expiry INTEGER := NEW.subscription_end - CURRENT_DATE;
    BEGIN
      -- Set status based on days until expiry
      IF days_until_expiry < 0 THEN
        NEW.subscription_status := 'inactive';
      ELSIF days_until_expiry <= 14 THEN
        NEW.subscription_status := 'expiring';
      ELSE
        NEW.subscription_status := 'active';
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subscription status
DROP TRIGGER IF EXISTS update_subscription_status_trigger ON schools;
CREATE TRIGGER update_subscription_status_trigger
  BEFORE UPDATE OF subscription_end ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();

-- Create function to get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  total_schools BIGINT,
  active_subscriptions BIGINT,
  expiring_subscriptions BIGINT,
  inactive_subscriptions BIGINT,
  standard_packages BIGINT,
  advanced_packages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_schools,
    COUNT(*) FILTER (WHERE subscription_status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'expiring') as expiring_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'inactive') as inactive_subscriptions,
    COUNT(*) FILTER (WHERE package_type = 'standard') as standard_packages,
    COUNT(*) FILTER (WHERE package_type = 'advanced') as advanced_packages
  FROM schools;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_reminders ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for subscription_history
CREATE POLICY "subscription_history_dsvi_admin_all" ON subscription_history 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "subscription_history_school_admin_read" ON subscription_history 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT id FROM schools WHERE admin_user_id = auth.uid()
  )
);

-- Add RLS policies for subscription_reminders
CREATE POLICY "subscription_reminders_dsvi_admin_all" ON subscription_reminders 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'DSVI_ADMIN'
);

CREATE POLICY "subscription_reminders_school_admin_read" ON subscription_reminders 
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'SCHOOL_ADMIN' AND
  school_id IN (
    SELECT id FROM schools WHERE admin_user_id = auth.uid()
  )
);

-- Set default subscription dates for existing schools (30 days from now)
UPDATE schools 
SET 
  subscription_start = CURRENT_DATE,
  subscription_end = CURRENT_DATE + INTERVAL '30 days',
  subscription_status = 'active'
WHERE subscription_start IS NULL;

SELECT 'Subscription management system created successfully!' as status;
