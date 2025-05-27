-- Create school_requests table for handling school access requests
CREATE TABLE IF NOT EXISTS school_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  school_type TEXT,
  student_count TEXT,
  website TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_school_requests_status ON school_requests(status);
CREATE INDEX IF NOT EXISTS idx_school_requests_created_at ON school_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_school_requests_email ON school_requests(contact_email);

-- Enable RLS
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- Policies for school_requests
-- Allow anyone to insert a request (for the public form)
CREATE POLICY "Anyone can submit school requests" ON school_requests
  FOR INSERT 
  WITH CHECK (true);

-- Only DSVI admins can view and manage requests
CREATE POLICY "DSVI admins can view all requests" ON school_requests
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );

CREATE POLICY "DSVI admins can update requests" ON school_requests
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'authenticated' 
    AND auth.jwt() -> 'user_metadata' ->> 'role' = 'DSVI_ADMIN'
  );
-- Add updated_at trigger
CREATE TRIGGER update_school_requests_updated_at 
  BEFORE UPDATE ON school_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add notification function for new requests
CREATE OR REPLACE FUNCTION notify_new_school_request()
RETURNS TRIGGER AS $$
BEGIN
  -- This could be extended to send actual notifications
  PERFORM pg_notify('new_school_request', json_build_object(
    'id', NEW.id,
    'school_name', NEW.school_name,
    'contact_email', NEW.contact_email
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER school_request_notification
  AFTER INSERT ON school_requests
  FOR EACH ROW EXECUTE FUNCTION notify_new_school_request();

SELECT 'School requests table created successfully!' as status;