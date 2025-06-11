-- Check current user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if user_id column exists or if it's named differently
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name LIKE '%user%';

-- Check current policies on user_profiles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
