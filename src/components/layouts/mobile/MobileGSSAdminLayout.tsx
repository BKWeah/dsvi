import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/mobile/MobileLayout';

export function MobileDSVIAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <MobileLayout
      title="DSVI Admin"
      subtitle="Manage schools and requests"
    >
      <Outlet />
    </MobileLayout>
  );
}
