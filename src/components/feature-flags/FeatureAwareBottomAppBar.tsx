import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEnabledNavigation } from '@/contexts/FeatureFlagContext';
import { cn } from '@/lib/utils';
import { BarChart3, School, Users, CreditCard, MessageSquare, FileText } from 'lucide-react';

const iconMap = {
  BarChart3,
  School, 
  Users,
  CreditCard,
  MessageSquare,
  FileText
};

interface FeatureAwareBottomAppBarProps {
  userRole: 'DSVI_ADMIN' | 'SCHOOL_ADMIN';
}

export function FeatureAwareBottomAppBar({ userRole }: FeatureAwareBottomAppBarProps) {
  const location = useLocation();
  const enabledNavigation = useEnabledNavigation();
  
  // Only show for DSVI_ADMIN for now
  if (userRole !== 'DSVI_ADMIN') {
    return null;
  }

  // Limit to 4 main navigation items for mobile
  const mobileNavItems = enabledNavigation.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
      <div className="grid grid-cols-4 h-16">
        {mobileNavItems.map((navItem) => {
          const IconComponent = iconMap[navItem.icon as keyof typeof iconMap] || School;
          const isActive = location.pathname.startsWith(navItem.route);
          
          return (
            <Link
              key={navItem.key}
              to={navItem.route}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="truncate max-w-full">
                {navItem.key.charAt(0).toUpperCase() + navItem.key.slice(1)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}