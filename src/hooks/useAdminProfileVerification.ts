import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminProfileVerification = () => {
  const { user } = useAuth();
  const { adminLevel, refreshAdminData } = useAdmin();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const verifyAndFixAdminProfile = async () => {
      // Only verify for DSVI admins who don't have an admin level yet
      if (!user || user.user_metadata?.role !== 'DSVI_ADMIN' || adminLevel !== null || isVerifying) {
        return;
      }

      // Check if this might be a Level 2 admin from pending invitations
      const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
      const activatedAdmins = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
      
      const isPendingLevel2 = pendingAdmins.some((admin: any) => 
        admin.email.toLowerCase() === user.email?.toLowerCase()
      );
      
      const wasActivatedLevel2 = activatedAdmins.includes(user.email?.toLowerCase());

      // If this user was a Level 2 invitation, try to create their profile
      if ((isPendingLevel2 || wasActivatedLevel2) && verificationAttempts < 3) {
        setIsVerifying(true);
        console.log('🔧 Attempting to fix Level 2 admin profile...');

        try {
          // First verify current status
          const { data: verifyData } = await supabase
            .rpc('get_admin_by_user_id', { p_user_id: user.id });

          if (verifyData && verifyData.length > 0 && verifyData[0].admin_level === 2) {
            console.log('✅ Level 2 admin profile already exists');
            await refreshAdminData();
            return;
          }

          // Find the pending admin configuration
          const pendingAdmin = pendingAdmins.find((admin: any) => 
            admin.email.toLowerCase() === user.email?.toLowerCase()
          );

          if (pendingAdmin) {
            // Create the admin profile directly in dsvi_admins table
            const { data: createResult, error: createError } = await supabase
              .from('dsvi_admins')
              .insert({
                user_id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
                admin_level: 2,
                permissions: pendingAdmin.permissions || [],
                school_ids: pendingAdmin.schools || [],
                notes: `Level 2 admin profile created post-signup on ${new Date().toLocaleDateString()}`,
                created_by: pendingAdmin.createdBy,
                signup_completed_at: new Date().toISOString()
              });

            if (createError) {
              console.error('❌ Error creating admin profile:', createError);
              throw createError;
            }

            if (createResult) {
              console.log('✅ Level 2 admin profile created successfully');

              // Remove from pending and add to activated
              const updatedPending = pendingAdmins.filter((admin: any) => 
                admin.email.toLowerCase() !== user.email?.toLowerCase()
              );
              localStorage.setItem('pendingLevel2Admins', JSON.stringify(updatedPending));
              
              if (!wasActivatedLevel2) {
                activatedAdmins.push(user.email?.toLowerCase());
                localStorage.setItem('activatedLevel2Admins', JSON.stringify(activatedAdmins));
              }

              toast({
                title: "Admin Profile Created",
                description: "Your Level 2 admin profile has been set up successfully.",
              });

              // Refresh admin data
              await refreshAdminData();
            }
          }
        } catch (error) {
          console.error('❌ Error fixing admin profile:', error);
          setVerificationAttempts(prev => prev + 1);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    // Run verification with a delay to ensure signup is complete
    const timer = setTimeout(verifyAndFixAdminProfile, 2000);
    return () => clearTimeout(timer);
  }, [user, adminLevel, isVerifying, verificationAttempts, refreshAdminData, toast]);

  return { isVerifying, verificationAttempts };
};
