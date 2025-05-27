-- STORAGE FIX: Create permissive storage policies (run only if file uploads fail)
-- Don't disable RLS on storage.objects, just create better policies

-- Drop existing storage policies and create permissive ones
DROP POLICY IF EXISTS "Public bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public bucket" ON storage.objects;  
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Create very permissive storage policies for testing
CREATE POLICY "Allow all operations on public bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'public');

-- Also allow public access to view files
CREATE POLICY "Public read access to public bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

SELECT 'Storage policies made permissive for testing!' as status;
