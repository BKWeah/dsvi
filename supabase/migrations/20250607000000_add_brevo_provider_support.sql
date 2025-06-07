-- Migration to add Brevo provider support to email_settings table
-- Date: 2025-06-07
-- Purpose: Fix email_settings provider constraint to include 'brevo'

-- Drop the existing constraint
ALTER TABLE email_settings DROP CONSTRAINT IF EXISTS email_settings_provider_check;

-- Add the new constraint that includes 'brevo'
ALTER TABLE email_settings ADD CONSTRAINT email_settings_provider_check 
CHECK (provider IN ('sendgrid', 'ses', 'resend', 'smtp', 'brevo'));

-- Update any existing records that might have invalid provider values (if any)
-- This is a safety measure in case there are any orphaned records
UPDATE email_settings 
SET provider = 'brevo' 
WHERE provider NOT IN ('sendgrid', 'ses', 'resend', 'smtp', 'brevo');

SELECT 'Email settings provider constraint updated to include Brevo!' as status;
