import { useState, useEffect } from 'react';
import { getSubdomainInfo, getCurrentSchoolSlug } from '@/lib/subdomain-utils';
import { getSchoolBySlug } from '@/lib/database';
import { School } from '@/lib/types';

export interface UseSubdomainSchoolResult {
  school: School | null;
  schoolSlug: string | null;
  isSubdomain: boolean;
  loading: boolean;
  error: string | null;
}

export function useSubdomainSchool(): UseSubdomainSchoolResult {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      setLoading(true);
      setError(null);

      try {
        const schoolSlug = getCurrentSchoolSlug();
        if (!schoolSlug) {
          setSchool(null);
          return;
        }

        const schoolData = await getSchoolBySlug(schoolSlug);
        if (!schoolData) {
          setError('School not found');
          setSchool(null);
        } else {
          setSchool(schoolData.school);
        }
      } catch (err) {
        console.error('Error fetching school:', err);
        setError('Failed to load school');
        setSchool(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, []);

  const subdomainInfo = getSubdomainInfo();
  return { 
    school, 
    schoolSlug: getCurrentSchoolSlug(), 
    isSubdomain: subdomainInfo.isSubdomain, 
    loading, 
    error 
  };
}
