import React from 'react';
import { FeatureGate } from '@/components/feature-flags/FeatureGate';

interface OptionalFeatureWrapperProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * OptionalFeatureWrapper - Wraps content with feature flags but gracefully falls back
 * to showing the original content if the feature flag system is not active
 */
export const OptionalFeatureWrapper: React.FC<OptionalFeatureWrapperProps> = ({
  feature,
  children,
  fallback
}) => {
  try {
    // Try to use the feature flag system
    return (
      <FeatureGate feature={feature} fallback={fallback}>
        {children}
      </FeatureGate>
    );
  } catch (error) {
    // If feature flag system is not available, just show the content
    console.warn('Feature flag system not available, showing content normally');
    return <>{children}</>;
  }
};

/**
 * Simple wrapper for components that should always show unless explicitly disabled
 */
export const SafeFeatureWrapper: React.FC<OptionalFeatureWrapperProps> = ({
  feature,
  children
}) => {
  return (
    <OptionalFeatureWrapper feature={feature} fallback={children}>
      {children}
    </OptionalFeatureWrapper>
  );
};

export default OptionalFeatureWrapper;