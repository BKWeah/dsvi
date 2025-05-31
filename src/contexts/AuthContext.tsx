
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (email: string, password: string, role: string, metadata?: any) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.user_metadata?.role || null;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user profile if user exists
      if (session?.user) {
        syncUserProfile(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user profile on auth change
      if (session?.user) {
        syncUserProfile(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to sync user profile
  const syncUserProfile = async (user: any) => {
    try {
      const role = user.user_metadata?.role || 'SCHOOL_ADMIN';
      const name = user.user_metadata?.name || user.email;
      
      await supabase.rpc('upsert_user_profile', {
        p_user_id: user.id,
        p_email: user.email,
        p_role: role,
        p_name: name
      });
    } catch (error) {
      console.warn('Failed to sync user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If login successful, sync user profile
    if (!error && data.user) {
      try {
        const role = data.user.user_metadata?.role || 'SCHOOL_ADMIN';
        const name = data.user.user_metadata?.name || data.user.email;
        
        await supabase.rpc('upsert_user_profile', {
          p_user_id: data.user.id,
          p_email: data.user.email,
          p_role: role,
          p_name: name
        });
      } catch (syncError) {
        console.warn('Failed to sync user profile:', syncError);
        // Don't fail login for this
      }
    }

    return { error };
  };

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

    // If signup successful, sync user profile
    if (!error && data.user) {
      try {
        const name = metadata?.name || data.user.email;
        
        await supabase.rpc('upsert_user_profile', {
          p_user_id: data.user.id,
          p_email: data.user.email,
          p_role: role,
          p_name: name
        });
      } catch (syncError) {
        console.warn('Failed to sync user profile during signup:', syncError);
        // Don't fail signup for this
      }
    }

    // If signup successful and it's a school admin, ensure assignment with fallback
    if (!error && data.user && role === 'SCHOOL_ADMIN' && metadata?.school_id) {
      // Wait for database trigger to process, then verify assignment
      setTimeout(async () => {
        try {
          // Check if the assignment worked
          const { data: school } = await supabase
            .from('schools')
            .select('admin_user_id')
            .eq('id', metadata.school_id)
            .single();

          // If still not assigned, do it manually
          if (school && !school.admin_user_id) {
            const { error: updateError } = await supabase
              .from('schools')
              .update({ 
                admin_user_id: data.user.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', metadata.school_id)
              .is('admin_user_id', null);
            
            if (updateError) {
              console.warn('Manual admin assignment failed:', updateError);
            } else {
              console.log('Manual admin assignment successful');
            }
          }
        } catch (err) {
          console.warn('Admin assignment verification failed:', err);
        }
      }, 2000); // Wait 2 seconds for trigger to complete
    }

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
