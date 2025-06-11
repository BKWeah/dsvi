import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AdminLevel, 
  PermissionType,
  ADMIN_LEVELS,
  RESTRICTED_PERMISSIONS,
  isRestrictedPermission 
} from './permissions';

// New consolidated admin interface (using dsvi_admin table)
interface DsviAdmin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  admin_level: number;
  permissions: string[];
  school_ids: string[];
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

interface UseAdminReturn {
  adminLevel: AdminLevel | null;
  adminData: DsviAdmin | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: PermissionType | string, schoolId?: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
  isLevel1Admin: boolean;
  isLevel2Admin: boolean;
  assignedSchools: string[];
  permissions: string[];
  refreshAdminData: () => Promise<void>;
}

export const useAdmin = (): UseAdminReturn => {
  const { user } = useAuth();
  const [adminLevel, setAdminLevel] = useState<AdminLevel | null>(null);
  const [adminData, setAdminData] = useState<DsviAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!user) {
      setAdminLevel(null);
      setAdminData(null);
      setLoading(false);
      return;
    }

    // Only process DSVI admins
    if (user.user_metadata?.role !== 'DSVI_ADMIN') {
      setAdminLevel(null);
      setAdminData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching admin data using consolidated dsvi_admin table for user:', user.id);

      // Get admin level using the new consolidated function
      const { data: levelData, error: levelError } = await supabase
        .rpc('get_admin_level_new', { p_user_id: user.id });

      if (levelError) {
        console.warn('❌ Error fetching admin level:', levelError);
        
        // If no admin level found, try to create Level 1 admin for backward compatibility
        if (user.user_metadata?.role === 'DSVI_ADMIN') {
          console.log('🔄 DSVI admin without level detected, attempting auto-migration...');
          
          const { error: migrationError } = await supabase.rpc('upsert_user_profile', {
            p_user_id: user.id,
            p_email: user.email || '',
            p_role: 'DSVI_ADMIN',
            p_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin'
          });

          if (!migrationError) {
            console.log('✅ Auto-migration completed, retrying fetch...');
            // Retry fetch after migration
            const { data: retryLevelData, error: retryLevelError } = await supabase
              .rpc('get_admin_level_new', { p_user_id: user.id });

            if (!retryLevelError && retryLevelData > 0) {
              setAdminLevel(retryLevelData);
              console.log('✅ Admin level fetched after migration:', retryLevelData);
            }
          }
        }
      } else if (levelData > 0) {
        setAdminLevel(levelData);
        console.log('✅ Admin level fetched:', levelData);
      }

      // Get complete admin profile using the new consolidated function
      const { data: adminProfileData, error: profileError } = await supabase
        .rpc('get_admin_by_user_id', { p_user_id: user.id });

      if (!profileError && adminProfileData && adminProfileData.length > 0) {
        const adminProfile = adminProfileData[0] as DsviAdmin;
        setAdminData(adminProfile);
        console.log('✅ Admin profile fetched from consolidated table:', adminProfile);
        
        // Update last login timestamp
        const { error: updateError } = await supabase
          .from('dsvi_admins')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', user.id);
          
        if (updateError) {
          console.warn('⚠️ Could not update last login timestamp:', updateError);
        }
      } else {
        console.warn('⚠️ Admin profile not found in consolidated table:', profileError);
        setAdminData(null);
      }

    } catch (err) {
      console.error('❌ Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAdminLevel(null);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    
    // Listen for admin level changes
    const handleAdminLevelChange = () => {
      console.log('🔄 Admin level change detected, refreshing admin data...');
      setTimeout(() => {
        fetchAdminData();
      }, 1000);
    };

    window.addEventListener('adminLevelChanged', handleAdminLevelChange);
    
    return () => {
      window.removeEventListener('adminLevelChanged', handleAdminLevelChange);
    };
  }, [user]);

  const hasPermission = useMemo(() => {
    return (permission: PermissionType | string, schoolId?: string): boolean => {
      if (!adminLevel || !adminData) return false;

      // Level 1 admins have all permissions
      if (adminLevel === ADMIN_LEVELS.SUPER_ADMIN) {
        return true;
      }

      // Level 2 admins cannot have restricted permissions
      if (isRestrictedPermission(permission)) {
        return false;
      }

      // Level 2 admins need explicit permissions
      if (adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF) {
        const hasPermission = adminData.permissions.includes(permission);
        
        // If permission exists and school-specific check is needed
        if (hasPermission && schoolId) {
          return adminData.school_ids.includes(schoolId);
        }
        
        return hasPermission;
      }

      return false;
    };
  }, [adminLevel, adminData]);

  const hasSchoolAccess = useMemo(() => {
    return (schoolId: string): boolean => {
      if (!adminLevel || !adminData) return false;

      // Level 1 admins have access to all schools
      if (adminLevel === ADMIN_LEVELS.SUPER_ADMIN) {
        return true;
      }

      // Level 2 admins only have access to assigned schools
      if (adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF) {
        return adminData.school_ids.includes(schoolId);
      }

      return false;
    };
  }, [adminLevel, adminData]);

  const isLevel1Admin = adminLevel === ADMIN_LEVELS.SUPER_ADMIN;
  const isLevel2Admin = adminLevel === ADMIN_LEVELS.ASSIGNED_STAFF;
  
  // Memoize assignedSchools and permissions to prevent unnecessary re-renders
  const assignedSchools = useMemo(() => {
    return adminData?.school_ids || [];
  }, [adminData]);

  const permissionsList = useMemo(() => {
    return adminData?.permissions || [];
  }, [adminData]);

  return {
    adminLevel,
    adminData,
    loading,
    error,
    hasPermission,
    hasSchoolAccess,
    isLevel1Admin,
    isLevel2Admin,
    assignedSchools,
    permissions: permissionsList,
    refreshAdminData: fetchAdminData,
  };
};
