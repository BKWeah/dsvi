import React, { ReactNode } from 'react';
import { useFeature } from '@/contexts/FeatureFlagContext';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: string[]; // Require all these features to be enabled
  requireAny?: string[]; // Require any of these features to be enabled
}

/**
 * FeatureGate component that conditionally renders children based on feature flags
 * 
 * @param feature - The feature path to check (e.g., "dashboard" or "schools.addSchool")
 * @param children - Content to render when feature is enabled
 * @param fallback - Optional fallback content when feature is disabled
 * @param requireAll - Array of features that must all be enabled
 * @param requireAny - Array of features where at least one must be enabled
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
  requireAll = [],
  requireAny = []
}) => {
  const isMainFeatureEnabled = useFeature(feature);
  
  // Check if all required features are enabled
  const allRequiredEnabled = requireAll.length === 0 || requireAll.every(f => useFeature(f));
  
  // Check if any of the required features are enabled
  const anyRequiredEnabled = requireAny.length === 0 || requireAny.some(f => useFeature(f));
  
  const shouldRender = isMainFeatureEnabled && allRequiredEnabled && anyRequiredEnabled;
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

/**
 * ConditionalWrapper component that conditionally wraps children with another component
 */
export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  wrapper,
  children
}) => {
  return condition ? <>{wrapper(children)}</> : <>{children}</>;
};

interface FeatureDebugProps {
  feature: string;
  showInProduction?: boolean;
}

/**
 * FeatureDebug component for debugging feature flag states
 */
export const FeatureDebug: React.FC<FeatureDebugProps> = ({
  feature,
  showInProduction = false
}) => {
  const isEnabled = useFeature(feature);
  
  // Only show in development mode unless explicitly enabled for production
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded opacity-50 z-50">
      {feature}: {isEnabled ? '✅' : '❌'}
    </div>
  );
};

export default FeatureGate;