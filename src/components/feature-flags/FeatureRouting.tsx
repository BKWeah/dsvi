import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

interface FeatureRoutingProps {
  children: React.ReactNode;
}

/**
 * FeatureRouting component that handles routing based on enabled features
 * Redirects users to appropriate pages when features are disabled
 */
export const FeatureRouting: React.FC<FeatureRoutingProps> = ({ children }) => {
  const { getDefaultRoute, getEnabledRoutes, isFeatureEnabled } = useFeatureFlags();
  const location = useLocation();
  
  // Get the current path
  const currentPath = location.pathname;
  
  // Check if current route corresponds to a disabled feature
  const enabledRoutes = getEnabledRoutes();
  const isCurrentRouteEnabled = enabledRoutes.some(route => currentPath.startsWith(route));
  
  // Special handling for dashboard route
  if (currentPath.includes('/dsvi-admin/dashboard') && !isFeatureEnabled('dashboard')) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // Special handling for schools routes
  if (currentPath.includes('/dsvi-admin/schools') && !isFeatureEnabled('schools')) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // Special handling for requests routes
  if (currentPath.includes('/dsvi-admin/requests') && !isFeatureEnabled('requests')) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // Special handling for subscriptions routes
  if (currentPath.includes('/dsvi-admin/subscriptions') && !isFeatureEnabled('subscriptions')) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // Special handling for messaging routes
  if (currentPath.includes('/dsvi-admin/messaging') && !isFeatureEnabled('messaging')) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // If we're on the base dsvi-admin route, redirect to default
  if (currentPath === '/dsvi-admin' || currentPath === '/dsvi-admin/') {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  // If current route is not enabled and it's a dsvi-admin route, redirect
  if (currentPath.startsWith('/dsvi-admin/') && !isCurrentRouteEnabled && enabledRoutes.length > 0) {
    // Don't redirect the deploy page
    if (!currentPath.includes('/deploy')) {
      const defaultRoute = getDefaultRoute();
      return <Navigate to={defaultRoute} replace />;
    }
  }
  
  return <>{children}</>;
};

export default FeatureRouting;