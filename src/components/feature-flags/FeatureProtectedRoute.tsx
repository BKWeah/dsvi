import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeature } from '@/contexts/FeatureFlagContext';

interface FeatureProtectedRouteProps {
  feature: string;
  children: React.ReactNode;
  fallbackRoute?: string;
}

/**
 * FeatureProtectedRoute - Protects routes based on feature flags
 * If feature is disabled, redirects to fallback route or first available route
 */
export const FeatureProtectedRoute: React.FC<FeatureProtectedRouteProps> = ({
  feature,
  children,
  fallbackRoute
}) => {
  let isFeatureEnabled = true;
  let isDashboardEnabled = true;
  let isSchoolsEnabled = true;
  let isRequestsEnabled = true;
  let isSubscriptionsEnabled = true;
  let isMessagingEnabled = true;

  try {
    isFeatureEnabled = useFeature(feature);
    isDashboardEnabled = useFeature('dashboard');
    isSchoolsEnabled = useFeature('schools');
    isRequestsEnabled = useFeature('requests');
    isSubscriptionsEnabled = useFeature('subscriptions');
    isMessagingEnabled = useFeature('messaging');
  } catch (error) {
    // If feature flag system is not available, allow access (non-destructive)
    console.warn('Feature flag system not available, allowing access to all routes');
    return <>{children}</>;
  }
  
  // If feature is enabled, show content
  if (isFeatureEnabled) {
    return <>{children}</>;
  }

  // If feature is disabled, redirect to fallback or find first available route
  const location = useLocation();
  
  // Don't redirect if already on the deploy page
  if (location.pathname.includes('/deploy')) {
    return <>{children}</>;
  }

  // Check for available routes in priority order
  const availableRoutes = [
    { route: '/dsvi-admin/dashboard', enabled: isDashboardEnabled },
    { route: '/dsvi-admin/schools', enabled: isSchoolsEnabled },
    { route: '/dsvi-admin/requests', enabled: isRequestsEnabled },
    { route: '/dsvi-admin/subscriptions', enabled: isSubscriptionsEnabled },
    { route: '/dsvi-admin/messaging', enabled: isMessagingEnabled }
  ];

  // Find first available route
  for (const { route, enabled } of availableRoutes) {
    if (enabled) {
      return <Navigate to={route} replace />;
    }
  }

  // If no routes are available, go to deploy page
  return <Navigate to="/deploy" replace />;
};

export default FeatureProtectedRoute;