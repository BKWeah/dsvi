import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  School, 
  Users, 
  Settings, 
  FileEdit,
  Plus
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

  const dsviAdminTabs: TabItem[] = [
    {
      id: 'schools',
      label: 'Schools',
      icon: School,
      path: '/dsvi-admin/schools',
      isActive: location.pathname.includes('/dsvi-admin/schools')
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: Users,
      path: '/dsvi-admin/requests',
      isActive: location.pathname.includes('/dsvi-admin/requests')
    },
    {
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
    }
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
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '#',
      isActive: false
    }
  ];

  const tabs = userRole === 'DSVI_ADMIN' ? dsviAdminTabs : schoolAdminTabs;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 pb-safe",
      className
    )}>
      <div className="grid grid-cols-3 h-16">
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
