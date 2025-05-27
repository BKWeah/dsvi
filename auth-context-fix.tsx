// Add this function to your AuthContext.tsx to handle manual admin assignment

import { supabase } from '@/integrations/supabase/client';

// Add this function inside the AuthProvider component
const assignSchoolAdmin = async (userId: string, schoolId: string) => {
  try {
    const { error } = await supabase
      .from('schools')
      .update({ 
        admin_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId)
      .is('admin_user_id', null); // Only update if no admin is currently assigned

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error assigning school admin:', error);
    return { success: false, error: error.message };
  }
};

// Modified signup function with automatic admin assignment
const signup = async (email: string, password: string, role: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
        ...metadata
      },
    },
  });

  // If signup successful and it's a school admin, ensure assignment
  if (!error && data.user && role === 'SCHOOL_ADMIN' && metadata?.school_id) {
    // Wait a moment for any database triggers to process
    setTimeout(async () => {
      const assignResult = await assignSchoolAdmin(data.user.id, metadata.school_id);
      if (!assignResult.success) {
        console.warn('Manual admin assignment needed for user:', data.user.id);
      }
    }, 1000);
  }

  return { data, error };
};