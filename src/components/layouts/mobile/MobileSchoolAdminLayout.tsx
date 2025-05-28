import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/mobile/MobileLayout';

export function MobileSchoolAdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchSchool();
    }
  }, [user]);

  const fetchSchool = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('name')
        .eq('admin_user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSchoolName(data.name);
      }
    } catch (error) {
      console.error('Error fetching school:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <MobileLayout
      title="School CMS"
      subtitle={schoolName || "Manage your school website"}
    >
      <Outlet />
    </MobileLayout>
  );
}
