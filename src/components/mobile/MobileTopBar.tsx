import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTopBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backUrl?: string;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function MobileTopBar({
  title,
  subtitle,
  showBackButton = true,
  onBackClick,
  backUrl,
  rightContent,
  leftContent,
  className,
  variant = 'elevated'
}: MobileTopBarProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };
  return (
    <div
      className={cn(
        "sticky top-0 z-50 bg-background border-b md:hidden",
        variant === 'elevated' && "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1">
          {leftContent && (
            <div className="flex items-center space-x-2">
              {leftContent}
            </div>
          )}
          {showBackButton && !leftContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="p-2 h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground leading-tight truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {rightContent && (
          <div className="flex items-center space-x-2 ml-3">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
// Preset configurations for common use cases
export function SchoolSettingsTopBar({ schoolName, onBack }: { schoolName?: string; onBack?: () => void }) {
  return (
    <MobileTopBar
      title="School Settings"
      subtitle={schoolName || "Configure school information"}
      onBackClick={onBack}
      backUrl="/dsvi-admin/schools"
    />
  );
}

export function EditPageTopBar({ pageTitle, schoolName, onBack }: { pageTitle: string; schoolName?: string; onBack?: () => void }) {
  return (
    <MobileTopBar
      title={`Edit ${pageTitle}`}
      subtitle={schoolName}
      onBackClick={onBack}
    />
  );
}