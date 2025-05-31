import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnabledNavigation, useFeature } from '@/contexts/FeatureFlagContext';
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
  MessageSquare,
  FileText
} from 'lucide-react';

const iconMap = {
  BarChart3,
  School, 
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  Home,
  Settings,
  FileEdit,
  Plus
};

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

export function FeatureAwareBottomAppBar({ userRole, className }: BottomAppBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const enabledNavigation = useEnabledNavigation();
  const canAddSchools = useFeature('schools.addSchool');

  // Build DSVI admin tabs based on enabled features
  const buildDSVIAdminTabs = (): TabItem[] => {
    const tabs: TabItem[] = [];
    
    // Add enabled navigation items (limited to 3 for space)
    const navItems = enabledNavigation.slice(0, 3);
    
    navItems.forEach((navItem) => {
      const IconComponent = iconMap[navItem.icon as keyof typeof iconMap] || School;
      tabs.push({
        id: navItem.key,
        label: navItem.key.charAt(0).toUpperCase() + navItem.key.slice(1),
        icon: IconComponent,
        path: navItem.route,
        isActive: location.pathname.startsWith(navItem.route)
      });
    });

    // Add action button if add school is enabled
    if (canAddSchools) {
      tabs.push({
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
      });
    }

    return tabs;
  };

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

  const tabs = userRole === 'DSVI_ADMIN' ? buildDSVIAdminTabs() : schoolAdminTabs;
  const gridCols = `grid-cols-${Math.min(tabs.length, 4)}`;

  // Don't render if no tabs are available
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 pb-safe",
      "block md:hidden", // Ensure it's only shown on mobile
      className
    )}>
      <div className={cn("grid h-16", gridCols)}>
        {tabs.map((tab) => {
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

export default FeatureAwareBottomAppBar;