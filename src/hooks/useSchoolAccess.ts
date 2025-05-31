import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasSchoolAccess } from '@/lib/database';

export function useSchoolAccess(schoolId?: string) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, role } = useAuth();

  useEffect(() => {
    async function checkAccess() {
      if (!user || !schoolId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // DSVI Admins have access to all schools
      if (role === 'DSVI_ADMIN') {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const access = await hasSchoolAccess(user.id, schoolId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking school access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, role, schoolId]);

  return { hasAccess, loading };
}