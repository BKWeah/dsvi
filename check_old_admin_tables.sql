-- Check if old admin tables still exist and remove them
-- This will help clean up auto-generated type definitions

-- Check current table status
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('admin_profiles', 'admin_permissions', 'admin_assignments')
AND table_schema = 'public';

-- If they exist, we should drop them to clean up the schema
-- (Run the DROP statements only if the tables exist and are not needed)

-- DROP TABLE IF EXISTS public.admin_assignments CASCADE;
-- DROP TABLE IF EXISTS public.admin_permissions CASCADE;  
-- DROP TABLE IF EXISTS public.admin_profiles CASCADE;

-- After dropping, regenerate Supabase types with:
-- npx supabase gen types typescript --local > src/integrations/supabase/types.ts
