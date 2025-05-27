-- RE-ENABLE RLS WITH PROPER POLICIES (run this later when you want security back)
-- Only run this after your app is fully working without RLS

-- Re-enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests ENABLE ROW LEVEL SECURITY;

-- Create working policies
-- Allow everyone to read
CREATE POLICY "Anyone can view schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Anyone can view pages" ON pages FOR SELECT USING (true);

-- Allow authenticated users to do everything (you can restrict this later)
CREATE POLICY "Authenticated users full access" ON schools FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON school_requests FOR ALL USING (auth.role() = 'authenticated');

-- Allow anyone to submit school requests
CREATE POLICY "Anyone can submit requests" ON school_requests FOR INSERT WITH CHECK (true);

SELECT 'RLS re-enabled with working policies!' as status;
