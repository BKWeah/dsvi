
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
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
