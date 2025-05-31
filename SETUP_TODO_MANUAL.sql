-- DSVI TODO Tracking System - Manual Setup
-- Copy and paste this into Supabase SQL Editor

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  estimated_hours REAL NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so clients can view progress)
CREATE POLICY "project_tasks_public_read" ON project_tasks 
FOR SELECT USING (true);

-- Allow authenticated users to modify
CREATE POLICY "project_tasks_authenticated_all" ON project_tasks 
FOR ALL USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_project_tasks_updated_at 
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the 130-hour MVP tasks
INSERT INTO project_tasks (id, title, estimated_hours, category, sub_category, priority, notes) VALUES 
-- Service Website (35h)
('sw-1', 'Project setup, routing & basic layout', 6, 'Service Website', 'Foundation', 'High', ''),
('sw-2', 'Homepage (hero, benefits, stats)', 4, 'Service Website', 'Core Pages', 'High', ''),
('sw-3', 'About, Team & How It Works pages', 5, 'Service Website', 'Core Pages', 'Medium', ''),
('sw-4', 'Packages page & basic testimonials', 3, 'Service Website', 'Core Pages', 'Medium', ''),
('sw-5', 'Registration form (frontend only)', 4, 'Service Website', 'Registration', 'High', ''),
('sw-6', 'Simple payment integration (one method)', 6, 'Service Website', 'Registration', 'High', 'Focus on one payment method'),
('sw-7', 'Contact page & FAQ', 3, 'Service Website', 'Support', 'Low', ''),
('sw-8', 'Basic SEO & deployment', 4, 'Service Website', 'Deploy', 'Medium', ''),

-- School Template (30h)
('st-1', 'Template foundation & responsive layout', 6, 'School Template', 'Foundation', 'High', ''),
('st-2', 'Homepage template (hero, programs)', 4, 'School Template', 'Templates', 'High', ''),
('st-3', 'About Us page template', 3, 'School Template', 'Templates', 'High', ''),
('st-4', 'Academics & Admissions templates', 4, 'School Template', 'Templates', 'Medium', ''),
('st-5', 'Contact & Faculty templates', 3, 'School Template', 'Templates', 'Medium', ''),
('st-6', 'Basic content editing (text only)', 6, 'School Template', 'CMS Basic', 'High', 'Simple text editing only'),
('st-7', 'Image upload (basic)', 4, 'School Template', 'CMS Basic', 'Medium', 'Basic image replacement'),

-- Admin Panel (45h)
('ap-1', 'Backend setup & simple database', 8, 'Admin Panel', 'Foundation', 'High', 'Use existing Supabase'),
('ap-2', 'Basic authentication (no RBAC)', 5, 'Admin Panel', 'Auth', 'High', 'Simple login only'),
('ap-3', 'Simple admin dashboard', 4, 'Admin Panel', 'Dashboard', 'High', ''),
('ap-4', 'School onboarding form', 6, 'Admin Panel', 'Onboarding', 'High', 'Manual template assignment'),
('ap-5', 'Basic content review system', 8, 'Admin Panel', 'Content', 'High', 'Simple approve/reject'),
('ap-6', 'School list & basic management', 4, 'Admin Panel', 'Management', 'Medium', ''),
('ap-7', 'Email notifications (basic)', 4, 'Admin Panel', 'Communication', 'Low', 'Simple email alerts'),
('ap-8', 'Basic reports & logs', 3, 'Admin Panel', 'Analytics', 'Low', 'Simple activity log'),
('ap-9', 'Admin panel deployment', 3, 'Admin Panel', 'Deploy', 'Medium', ''),

-- Integration & Testing (15h)
('int-1', 'Basic integration testing', 6, 'Integration', 'Testing', 'High', 'Essential flows only'),
('int-2', 'Bug fixes & basic documentation', 5, 'Integration', 'Quality', 'Medium', ''),
('int-3', 'Final deployment & handover', 4, 'Integration', 'Delivery', 'High', '')

ON CONFLICT (id) DO NOTHING;

SELECT 'TODO tracking system created successfully!' as message;