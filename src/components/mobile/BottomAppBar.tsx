import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeature } from '@/contexts/FeatureFlagContext';
import { cn } from '@/lib/utils';
import { 
  Home, 
  School, 
  Users, 
  Settings, 
  FileEdit,
  Plus,
  BarChart3,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface BottomAppBarProps {
  userRole: 'DSVI_ADMIN' | 'SCHOOL_ADMIN';
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  isActive: boolean;
  isAction?: boolean;
  onClick?: () => void;
}

export function BottomAppBar({ userRole, className }: BottomAppBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Feature flag checks with fallback to true (non-destructive)
  let isDashboardEnabled = true;
  let isSchoolsEnabled = true;
  let isRequestsEnabled = true;
  let isSubscriptionsEnabled = true;
  let isMessagingEnabled = true;
  let canAddSchools = true;

  try {
    isDashboardEnabled = useFeature('dashboard');
    isSchoolsEnabled = useFeature('schools'); 
    isRequestsEnabled = useFeature('requests');
    isSubscriptionsEnabled = useFeature('subscriptions');
    isMessagingEnabled = useFeature('messaging');
    canAddSchools = useFeature('schools.addSchool');
  } catch (error) {
    // If feature flag system is not available, show everything (non-destructive)
    console.warn('Feature flag system not available, showing all navigation items');
  }

  const dsviAdminTabs: TabItem[] = [
    ...(isDashboardEnabled ? [{
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/dsvi-admin/dashboard',
      isActive: location.pathname.includes('/dsvi-admin/dashboard')
    }] : []),
    ...(isSchoolsEnabled ? [{
      id: 'schools',
      label: 'Schools',
      icon: School,
      path: '/dsvi-admin/schools',
      isActive: location.pathname.includes('/dsvi-admin/schools')
    }] : []),
    ...(isRequestsEnabled ? [{
      id: 'requests',
      label: 'Requests',
      icon: Users,
      path: '/dsvi-admin/requests',
      isActive: location.pathname.includes('/dsvi-admin/requests')
    }] : []),
    ...(isSubscriptionsEnabled ? [{
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      path: '/dsvi-admin/subscriptions',
      isActive: location.pathname.includes('/dsvi-admin/subscriptions')
    }] : []),
    ...(isMessagingEnabled ? [{
      id: 'messaging',
      label: 'Messages',
      icon: MessageSquare,
      path: '/dsvi-admin/messaging',
      isActive: location.pathname.includes('/dsvi-admin/messaging')
    }] : []),
    ...(isSchoolsEnabled && canAddSchools ? [{
      id: 'add',
      label: 'Add',
      icon: Plus,
      path: '#',
      isActive: false,
      isAction: true,
      onClick: () => {
        // Trigger add school dialog
        const event = new CustomEvent('openAddSchoolDialog');
        window.dispatchEvent(event);
      }
    }] : [])
  ];

  const schoolAdminTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/school-admin',
      isActive: location.pathname === '/school-admin'
    },
    {
      id: 'pages',
      label: 'Pages',
      icon: FileEdit,
      path: '/school-admin/pages/homepage/edit',
      isActive: location.pathname.includes('/school-admin/pages')
    },
    {
      id: 'messaging',
      label: 'Messages',
      icon: MessageSquare,
      path: '/school-admin/messaging',
      isActive: location.pathname.includes('/school-admin/messaging')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '#',
      isActive: false
    }
  ];

  const tabs = userRole === 'DSVI_ADMIN' ? dsviAdminTabs : schoolAdminTabs;
  
  // Ensure we have at least one tab and limit to 4 for mobile
  const visibleTabs = tabs.slice(0, 4);
  const gridCols = visibleTabs.length > 0 ? `grid-cols-${Math.min(visibleTabs.length, 4)}` : 'grid-cols-1';

  // Don't render if no tabs are available
  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 pb-safe",
      "block md:hidden", // Ensure it's only shown on mobile
      className
    )}>
      <div className={cn("grid h-16", gridCols)}>
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isActive;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction && tab.onClick) {
                  tab.onClick();
                } else if (!tab.isAction) {
                  navigate(tab.path);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors touch-feedback",
                isActive ? "text-primary" : "text-muted-foreground",
                tab.isAction && "bg-primary text-primary-foreground rounded-2xl mx-4 my-2 shadow-lg"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                tab.isAction && "h-5 w-5"
              )} />
              <span className={cn(
                "text-xs font-medium",
                tab.isAction && "text-xs"
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
