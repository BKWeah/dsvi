import { supabase } from '@/integrations/supabase/client';

// Debug utility to test database connections and relationships
export async function debugDatabaseConnections() {
  console.log('🔍 Starting database connection debug...');
  
  try {
    // Test 1: Check if user_profiles table exists and is accessible
    console.log('📋 Testing user_profiles table...');
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (userError) {
      console.error('❌ user_profiles error:', userError);
    } else {
      console.log('✅ user_profiles data:', userProfiles);
    }

    // Test 2: Check schools table
    console.log('📋 Testing schools table...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, subscription_status, package_type')
      .limit(5);
    
    if (schoolsError) {
      console.error('❌ schools error:', schoolsError);
    } else {
      console.log('✅ schools data:', schools);
    }

    // Test 3: Check activity_logs table
    console.log('📋 Testing activity_logs table...');
    const { data: activityLogs, error: activityError } = await supabase
      .from('activity_logs')
      .select('*')
      .limit(5);
    
    if (activityError) {
      console.error('❌ activity_logs error:', activityError);
    } else {
      console.log('✅ activity_logs data:', activityLogs);
    }

    // Test 4: Check activity_logs with relationships
    console.log('📋 Testing activity_logs with relationships...');
    const { data: activityWithRels, error: activityRelsError } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:user_id(id, email, role, name),
        school:school_id(id, name, slug)
      `)
      .limit(3);
    
    if (activityRelsError) {
      console.error('❌ activity_logs relationships error:', activityRelsError);
    } else {
      console.log('✅ activity_logs with relationships:', activityWithRels);
    }

    // Test 5: Check school_requests
    console.log('📋 Testing school_requests table...');
    const { data: requests, error: requestsError } = await supabase
      .from('school_requests')
      .select('id, status')
      .eq('status', 'pending')
      .limit(5);
    
    if (requestsError) {
      console.error('❌ school_requests error:', requestsError);
    } else {
      console.log('✅ school_requests data:', requests);
    }

    // Test 6: Test the upsert_user_profile function
    console.log('📋 Testing upsert_user_profile function...');
    const currentUser = await supabase.auth.getUser();
    if (currentUser.data.user) {
      const { data: upsertResult, error: upsertError } = await supabase.rpc('upsert_user_profile', {
        p_user_id: currentUser.data.user.id,
        p_email: currentUser.data.user.email,
        p_role: currentUser.data.user.user_metadata?.role || 'SCHOOL_ADMIN',
        p_name: currentUser.data.user.user_metadata?.name || currentUser.data.user.email
      });
      
      if (upsertError) {
        console.error('❌ upsert_user_profile error:', upsertError);
      } else {
        console.log('✅ upsert_user_profile result:', upsertResult);
      }
    }

    console.log('🎉 Database debug complete!');
    return true;
  } catch (error) {
    console.error('💥 Debug failed:', error);
    return false;
  }
}

// Simple function to manually sync current user
export async function syncCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const { error } = await supabase.rpc('upsert_user_profile', {
      p_user_id: user.id,
      p_email: user.email,
      p_role: user.user_metadata?.role || 'SCHOOL_ADMIN',
      p_name: user.user_metadata?.name || user.email
    });

    if (error) {
      console.error('Failed to sync user:', error);
    } else {
      console.log('User synced successfully');
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}