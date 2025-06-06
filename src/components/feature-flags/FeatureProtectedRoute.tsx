import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeature, useFeatureFlags } from '@/contexts/FeatureFlagContext'; // Import useFeatureFlags

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
  const { isLoading: featureFlagsLoading, config } = useFeatureFlags();
  const isFeatureEnabled = useFeature(feature);
  const location = useLocation();

  // Display loading spinner while feature flags are loading
  if (featureFlagsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If feature is enabled, show content
  if (isFeatureEnabled) {
    return <>{children}</>;
  }

  // If feature is disabled, redirect
  const defaultRedirectRoute = config.routing.defaultRedirect;
  const effectiveFallbackRoute = fallbackRoute || config.routing.fallbackRoute; // Use prop fallbackRoute if provided, else config fallback

  // Prevent redirect loops: if we are already on the default redirect or effective fallback route,
  // and the feature is still disabled, it means there's no valid route to go to.
  // In this case, navigate to Unauthorized or a generic error page.
  if (location.pathname === defaultRedirectRoute || location.pathname === effectiveFallbackRoute) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Try to redirect to the default redirect route first
  if (defaultRedirectRoute) {
    return <Navigate to={defaultRedirectRoute} replace />;
  }

  // If no default redirect, try the effective fallback route
  if (effectiveFallbackRoute) {
    return <Navigate to={effectiveFallbackRoute} replace />;
  }

  // As a last resort, if no routes are configured, go to unauthorized
  return <Navigate to="/unauthorized" replace />;
};

export default FeatureProtectedRoute;
