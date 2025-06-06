
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
            console.log('🔄 Processing Level 2 admin signup with invite token:', metadata.inviteToken);
            const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
            const pendingAdmin = pendingAdmins.find((admin: any) => 
              admin.inviteToken === metadata.inviteToken
            );
            
            if (pendingAdmin) {
              console.log('✅ Found matching Level 2 admin invitation:', pendingAdmin);
              
              // Verify the email matches the invitation (security check)
              if (pendingAdmin.email.toLowerCase() !== email.toLowerCase()) {
                console.warn('❌ Email mismatch in Level 2 admin signup');
                return { error };
              }
              
              // Check if invitation hasn't expired
              const now = new Date();
              const expiresAt = new Date(pendingAdmin.expiresAt);
              
              if (now > expiresAt) {
                console.warn('❌ Invitation has expired');
                // Don't create Level 2 admin profile, but allow signup as regular DSVI admin
                return { error };
              }
              
              console.log('🚀 Creating Level 2 admin profile...');
              
              // Use the new safe_create_admin_profile function for better reliability
              const { data: profileResult, error: profileError } = await supabase.rpc('safe_create_admin_profile', {
                p_user_id: data.user.id,
                p_admin_level: 2, // Level 2 admin
                p_created_by: pendingAdmin.createdBy,
                p_notes: pendingAdmin.notes || `Level 2 admin created from invitation on ${new Date().toLocaleDateString()}`
              }) as { data: { success: boolean } | null, error: any }; // Type assertion

              if (profileError || !profileResult?.success) {
                console.error('❌ Failed to create Level 2 admin profile:', profileError || profileResult);
                // Don't throw - allow the signup to succeed and handle profile creation later
                console.warn('⚠️ Admin profile creation failed, but user signup succeeded. Profile can be created manually.');
              } else {
                console.log('✅ Level 2 admin profile result:', profileResult);
                // Set admin level immediately after successful profile creation
                setAdminLevel(2);
              }

              // Grant selected permissions
              for (const permission of pendingAdmin.permissions || []) {
                const { error: permError } = await supabase.rpc('grant_admin_permission', {
                  target_user_id: data.user.id,
                  permission_type: permission,
                  granted_by_user_id: pendingAdmin.createdBy
                });
                
                if (permError) {
                  console.warn('⚠️ Failed to grant permission:', permission, permError);
                } else {
                  console.log('✅ Granted permission:', permission);
                }
              }

              // Assign to selected schools
              for (const schoolId of pendingAdmin.schools || []) {
                const { error: assignError } = await supabase.rpc('assign_school_to_admin', {
                  target_user_id: data.user.id,
                  target_school_id: schoolId,
                  assigned_by_user_id: pendingAdmin.createdBy
                });
                
                if (assignError) {
                  console.warn('⚠️ Failed to assign school:', schoolId, assignError);
                } else {
                  console.log('✅ Assigned to school:', schoolId);
                }
              }

              // Remove from pending list (mark as used)
              const updatedPending = pendingAdmins.filter((admin: any) => 
                admin.inviteToken !== metadata.inviteToken
              );
              localStorage.setItem('pendingLevel2Admins', JSON.stringify(updatedPending));
              
              // Mark admin as activated for tracking purposes - REMOVED THIS LINE
              // const activatedAdmins = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
              // if (!activatedAdmins.includes(email.toLowerCase())) {
              //   activatedAdmins.push(email.toLowerCase());
              //   localStorage.setItem('activatedLevel2Admins', JSON.stringify(activatedAdmins));
              // }
              
              console.log('🎉 Level 2 admin setup completed successfully');
              
              // Verify the admin setup is complete
              const { data: verifyData, error: verifyError } = await supabase
                .rpc('verify_admin_setup', { p_user_id: data.user.id }) as { data: { success: boolean } | null, error: any }; // Type assertion
              
              if (!verifyError && verifyData?.success) {
                console.log('✅ Admin setup verification:', verifyData);
              } else {
                console.error('❌ Admin setup verification failed:', verifyError || verifyData);
              }
              
              // Dispatch event to notify useAdmin hook to refresh
              window.dispatchEvent(new CustomEvent('adminLevelChanged'));
              
              // Also refresh the admin level in this context with increased delay - REMOVED THIS LINE
              // setTimeout(() => {
              //   console.log('🔄 Refreshing admin level in AuthContext...');
              //   fetchAdminLevel(data.user);
              // }, 2000); // Increased delay to ensure all operations complete
            } else {
              console.log('❌ No matching invitation found for token:', metadata.inviteToken);
            }
          } catch (adminError) {
            console.error('❌ Failed to apply Level 2 admin configuration:', adminError);
          }
        }
        // Fallback: Check for pending admin by email only (backward compatibility)
        else if (role === 'DSVI_ADMIN') {
          try {
            const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
            const pendingAdmin = pendingAdmins.find((admin: any) => 
              admin.email.toLowerCase() === email.toLowerCase() && !admin.inviteToken
            );
            
            if (pendingAdmin) {
              console.log('Found legacy pending Level 2 admin configuration, applying...');
              
              // Create Level 2 admin profile
              await supabase.rpc('create_admin_profile', {
                target_user_id: data.user.id,
                admin_level: 2, // Level 2 admin
                created_by_user_id: pendingAdmin.createdBy,
                notes: pendingAdmin.notes || `Level 2 admin created from invitation on ${new Date().toLocaleDateString()}`
              });

              // Grant selected permissions
              for (const permission of pendingAdmin.permissions || []) {
                await supabase.rpc('grant_admin_permission', {
                  target_user_id: data.user.id,
                  permission_type: permission,
                  granted_by_user_id: pendingAdmin.createdBy
                });
              }

              // Assign to selected schools
              for (const schoolId of pendingAdmin.schools || []) {
                await supabase.rpc('assign_school_to_admin', {
                  target_user_id: data.user.id,
                  target_school_id: schoolId,
                  assigned_by_user_id: pendingAdmins.createdBy
                });
              }

              // Remove from pending list
              const updatedPending = pendingAdmins.filter((admin: any) => 
                admin.email.toLowerCase() !== email.toLowerCase()
              );
              localStorage.setItem('pendingLevel2Admins', JSON.stringify(updatedPending));
              
              // Mark admin as activated for tracking purposes - REMOVED THIS LINE
              // const activatedAdmins = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
              // if (!activatedAdmins.includes(email.toLowerCase())) {
              //   activatedAdmins.push(email.toLowerCase());
              //   localStorage.setItem('activatedLevel2Admins', JSON.stringify(activatedAdmins));
              // }
              
              console.log('Legacy Level 2 admin profile automatically created and configured');
              
              // Dispatch event to notify useAdmin hook to refresh
              window.dispatchEvent(new CustomEvent('adminLevelChanged'));
              
              // Also refresh the admin level in this context - REMOVED THIS LINE
              // setTimeout(() => {
              //   fetchAdminLevel(data.user);
              // }, 500);
            }
          } catch (adminError) {
            console.warn('Failed to apply legacy Level 2 admin configuration:', adminError);
          }
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
