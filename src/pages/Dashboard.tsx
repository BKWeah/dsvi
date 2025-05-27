
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { role } = useAuth();

  // Redirect to appropriate dashboard based on role
  if (role === 'DSVI_ADMIN') {
    return <Navigate to="/dsvi-admin" replace />;
  } else if (role === 'SCHOOL_ADMIN') {
    return <Navigate to="/school-admin" replace />;
  }

  return <Navigate to="/login" replace />;
}
