-- Quick test to verify the Level 2 invitation functions are working

-- Test 1: Check if the functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_admin_invitation', 'create_admin_from_invitation', 'debug_admin_details')
ORDER BY routine_name;

-- Test 2: Check function signature for create_admin_invitation (should include p_base_url parameter)
SELECT pg_get_function_identity_arguments(oid) as function_signature
FROM pg_proc 
WHERE proname = 'create_admin_invitation';

-- Test 3: Check if pending_admin_invitations table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pending_admin_invitations'
ORDER BY ordinal_position;

-- Test 4: Check if dsvi_admins table exists and has correct structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dsvi_admins'
ORDER BY ordinal_position;
