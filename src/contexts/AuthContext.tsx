
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  adminLevel: number | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (email: string, password: string, role: string, metadata?: any) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  refreshAdminLevel: () => Promise<void>;
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
  const [adminLevel, setAdminLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.user_metadata?.role || null;

  // Helper function to fetch admin level for DSVI admins
  const fetchAdminLevel = async (user: User) => {
    if (user.user_metadata?.role === 'DSVI_ADMIN') {
      try {
        const { data, error } = await supabase
          .rpc('get_admin_level', { user_id: user.id });
        
        if (!error && data !== null && data > 0) { // Ensure data is not null and valid
          setAdminLevel(data);
        } else {
          setAdminLevel(null);
          if (user.user_metadata?.role === 'DSVI_ADMIN') {
            console.log('DSVI admin found without admin level or level could not be fetched.');
          }
        }
      } catch (error) {
        console.warn('Failed to fetch admin level:', error);
        setAdminLevel(null);
      }
    } else {
      setAdminLevel(null);
    }
  };

  const refreshAdminLevel = async () => {
    if (user) {
      await fetchAdminLevel(user);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user profile if user exists
      if (session?.user) {
        syncUserProfile(session.user);
        fetchAdminLevel(session.user);
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
        fetchAdminLevel(session.user);
      } else {
        setAdminLevel(null);
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

    // If login successful, sync user profile and fetch admin level
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

        // Fetch admin level for DSVI admins
        await fetchAdminLevel(data.user);
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

        // Check if this is a Level 2 admin signup based on invite token
        if (role === 'DSVI_ADMIN' && metadata?.inviteToken) {
          try {
            console.log('🔄 Processing Level 2 admin signup with database invitation...');
            console.log('🔄 Invite token:', metadata.inviteToken);
            console.log('🔄 User data:', { id: data.user.id, email: data.user.email });
            
            // Use the new database function instead of localStorage
            const { data: signupResult, error: signupError } = await supabase.rpc('process_level2_admin_signup', {
              p_user_id: data.user.id,
              p_email: email,
              p_invite_token: metadata.inviteToken
            });

            console.log('🔄 Database signup result:', signupResult);
            console.log('🔄 Database signup error:', signupError);

            if (signupError) {
              console.error('❌ Database Level 2 admin signup failed:', signupError);
              console.warn('⚠️ Admin creation failed, but user signup succeeded. Check invitation token and database.');
            } else if (!signupResult?.success) {
              console.error('❌ Level 2 admin signup returned failure:', signupResult);
              console.warn('⚠️ Admin creation failed:', signupResult?.message);
              
              // Log helpful debug info
              if (signupResult?.message?.includes('Invalid invitation')) {
                console.log('🔍 Debug: Check if invitation exists, is expired, or email matches');
                console.log('🔍 Expected email:', email);
                console.log('🔍 Invite token:', metadata.inviteToken);
              }
            } else {
              console.log('✅ Level 2 admin created successfully from database invitation!');
              console.log('✅ Creation details:', signupResult);
              
              // Set admin level immediately after successful creation
              setAdminLevel(2);
              
              console.log('🎉 Level 2 admin setup completed successfully');
              
              // Dispatch event to notify useAdmin hook to refresh
              window.dispatchEvent(new CustomEvent('adminLevelChanged'));
            }
          } catch (adminError) {
            console.error('❌ Failed to process Level 2 admin signup:', adminError);
            console.error('❌ Error details:', adminError);
          }
        }
        // Remove the localStorage fallback since we're now using database
        else if (role === 'DSVI_ADMIN') {
          console.log('🔄 DSVI_ADMIN signup without invite token - regular admin account created');
        }
                

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
    try {
      // Clear local storage items related to Supabase session
      localStorage.removeItem('sb-rzfilfpjxfinxxfldzuv-auth-token');
      localStorage.removeItem('sb-rzfilfpjxfinxxfldzuv-auth-token-refresh');
      localStorage.removeItem('sb-rzfilfpjxfinxxfldzuv-auth-token-expires-at');
      localStorage.removeItem('sb-rzfilfpjxfinxxfldzuv-auth-token-type');
      localStorage.removeItem('sb-rzfilfpjxfinxxfldzuv-auth-token-value');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('User logged out successfully.');
      }
    } catch (err) {
      console.error('An unexpected error occurred during logout:', err);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    adminLevel,
    loading,
    login,
    signup,
    logout,
    refreshAdminLevel,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
