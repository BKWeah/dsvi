import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileBottomActionBarProps {
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
  showOnDesktop?: boolean;
}

export function MobileBottomActionBar({
  children,
  primaryAction,
  secondaryAction,
  className,
  showOnDesktop = false
}: MobileBottomActionBarProps) {  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 pb-safe",
        !showOnDesktop && "md:hidden",
        className
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div className="p-4">
        {children ? (
          children
        ) : (
          <div className="flex space-x-3">
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="flex-1 h-12 text-base"
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'default'}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
                className={cn(
                  "h-12 text-base font-medium",
                  secondaryAction ? "flex-1" : "w-full"
                )}
              >
                {primaryAction.loading ? 'Loading...' : primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}