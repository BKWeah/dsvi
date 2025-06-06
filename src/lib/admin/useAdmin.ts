import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AdminLevel, 
  PermissionType, 
  AdminProfile, 
  AdminPermission, 
  AdminAssignment,
  ADMIN_LEVELS,
  RESTRICTED_PERMISSIONS,
  isRestrictedPermission 
} from './permissions';

interface UseAdminReturn {
  adminLevel: AdminLevel | null;
  adminProfile: AdminProfile | null;
  permissions: AdminPermission[];
  assignments: AdminAssignment[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: PermissionType | string, resourceId?: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
  isLevel1Admin: boolean;
  isLevel2Admin: boolean;
  assignedSchools: string[];
  refreshAdminData: () => Promise<void>;
}

export const useAdmin = (): UseAdminReturn => {
  const { user } = useAuth();
  const [adminLevel, setAdminLevel] = useState<AdminLevel | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check for pending invitations
  const checkForPendingInvitation = (email: string): boolean => {
    try {
      const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
      return pendingAdmins.some((admin: any) => 
        admin.email.toLowerCase() === email.toLowerCase()
      );
    } catch {
      return false;
    }
  };

  const fetchAdminData = async () => {
    if (!user) {
      setAdminLevel(null);
      setAdminProfile(null);
      setPermissions([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    // Only process DSVI admins
    if (user.user_metadata?.role !== 'DSVI_ADMIN') {
      setAdminLevel(null);
      setAdminProfile(null);
      setPermissions([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get admin level
      const { data: levelData, error: levelError } = await supabase
        .rpc('get_admin_level', { user_id: user.id });

      if (levelError) {
        console.warn('Error fetching admin level:', levelError);
        // Don't auto-upgrade to avoid conflicts with Level 2 admin signup
        setAdminLevel(null);
      } else {
        const level = levelData as AdminLevel;
        if (level > 0) {
          setAdminLevel(level);
          
          // Get admin profile
          const { data: profileData, error: profileError } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.warn('Error fetching admin profile:', profileError);
          } else {
            setAdminProfile(profileData);
          }

          // For Level 2 admins, get permissions and assignments
          if (level === ADMIN_LEVELS.ASSIGNED_STAFF) {
            // Get permissions
            const { data: permissionsData, error: permissionsError } = await supabase
              .from('admin_permissions')
              .select('*')
              .eq('admin_user_id', user.id)
              .eq('is_active', true);

            if (permissionsError) {
              console.warn('Error fetching permissions:', permissionsError);
            } else {
              setPermissions(permissionsData || []);
            }

            // Get school assignments
            const { data: assignmentsData, error: assignmentsError } = await supabase
              .from('admin_assignments')
              .select('*')
              .eq('admin_user_id', user.id)
              .eq('is_active', true);

            if (assignmentsError) {
              console.warn('Error fetching assignments:', assignmentsError);
            } else {
              setAssignments(assignmentsData || []);
            }
          } else {
            // Level 1 admin has no specific permissions/assignments
            setPermissions([]);
            setAssignments([]);
          }
        } else {
          // No admin level found - could be:
          // 1. A Level 2 admin who just signed up (profile creation in progress)
          // 2. An existing DSVI admin who needs manual upgrade
          // 
          // We no longer auto-upgrade to Level 1 to avoid conflicts with Level 2 signup
          setAdminLevel(null);
          console.log('DSVI admin found without admin level - manual admin profile creation required');
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Don't default to Level 1 on error - let admin profile be explicitly created
      setAdminLevel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    
    // Also listen for admin level changes (e.g., when Level 2 admin is created)
    const handleAdminLevelChange = () => {
      console.log('Admin level change detected, refreshing admin data...');
      setTimeout(() => {
        fetchAdminData();
      }, 1000); // Small delay to ensure database operations complete
    };

    // Listen for custom event that AuthContext can dispatch
    window.addEventListener('adminLevelChanged', handleAdminLevelChange);
    
    return () => {
      window.removeEventListener('adminLevelChanged', handleAdminLevelChange);
    };
  }, [user]);

  const hasPermission = (permission: PermissionType | string, resourceId?: string): boolean => {
    if (!adminLevel) return false;

    // Level 1 admins have all permissions except for restricted ones they explicitly need to check
    if (adminLevel === ADMIN_LEVELS.SUPER_ADMIN) {
      return true;
    }

    // Level 2 admins cannot have restricted permissions
    if (isRestrictedPermission(permission)) {
      return false;
    }

    // Level 2 admins need explicit permissions
    if (adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF) {
      return permissions.some(p => 
        p.permission_type === permission &&
        (resourceId ? p.resource_id === resourceId : true) &&
        p.is_active &&
        (!p.expires_at || new Date(p.expires_at) > new Date())
      );
    }

    return false;
  };

  const hasSchoolAccess = (schoolId: string): boolean => {
    if (!adminLevel) return false;

    // Level 1 admins have access to all schools
    if (adminLevel === ADMIN_LEVELS.SUPER_ADMIN) {
      return true;
    }

    // Level 2 admins only have access to assigned schools
    if (adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF) {
      return assignments.some(a => a.school_id === schoolId && a.is_active);
    }

    return false;
  };

  const isLevel1Admin = adminLevel === ADMIN_LEVELS.SUPER_ADMIN;
  const isLevel2Admin = adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF;
  const assignedSchools = assignments.map(a => a.school_id);

  return {
    adminLevel,
    adminProfile,
    permissions,
    assignments,
    loading,
    error,
    hasPermission,
    hasSchoolAccess,
    isLevel1Admin,
    isLevel2Admin,
    assignedSchools,
    refreshAdminData: fetchAdminData,
  };
};
