import React, { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileLayout({ 
  children, 
  title, 
  subtitle, 
  className,
  showBackButton,
  onBack 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onBack={onBack}
      />
      <main className={cn("p-4 pb-20", className)}>
        {children}
      </main>
    </div>
  );
}
