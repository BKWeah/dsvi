import React, { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveWrapperProps {
  children: ReactNode;
  mobileComponent?: ReactNode;
  breakpoint?: string;
}

export function ResponsiveWrapper({ 
  children, 
  mobileComponent, 
  breakpoint = '768px' 
}: ResponsiveWrapperProps) {
  const isMobile = useMediaQuery(`(max-width: ${breakpoint})`);
  
  // If mobile component is provided and we're on mobile, render it
  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>;
  }
  
  // Otherwise render the desktop version with responsive classes
  return (
    <div className="min-h-screen">
      <div className="hidden md:block">
        {children}
      </div>
      <div className="md:hidden">
        {mobileComponent || children}
      </div>
    </div>
  );
}
