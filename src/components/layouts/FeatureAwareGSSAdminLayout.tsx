import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEnabledNavigation, useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FeatureGate } from '@/components/feature-flags/FeatureGate';
import { FeatureAwareBottomAppBar } from '@/components/mobile/FeatureAwareBottomAppBar';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { LogOut, BarChart3, School, Users, CreditCard, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  BarChart3,
  School,
  Users,
  CreditCard,
  MessageSquare,
  FileText
};

export function FeatureAwareDSVIAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const enabledNavigation = useEnabledNavigation();
  const { isFeatureEnabled } = useFeatureFlags();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Layout with Bottom App Bar */}
      <FeatureGate feature="navigation.bottomAppBar">
        <div className="md:hidden min-h-screen bg-background">
          <main className="pb-20">
            <Outlet />
          </main>
          <FeatureAwareBottomAppBar userRole="DSVI_ADMIN" />
        </div>
      </FeatureGate>

      {/* Desktop Layout with Sidebar */}
      <FeatureGate feature="navigation.sidebar">
        <div className="hidden md:block">
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Sidebar>
                <SidebarHeader className="p-4">
                  <h2 className="text-lg font-semibold">DSVI Admin</h2>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarMenu>
                    {enabledNavigation.map((navItem) => {
                      const IconComponent = iconMap[navItem.icon as keyof typeof iconMap] || School;
                      
                      return (
                        <SidebarMenuItem key={navItem.key}>
                          <SidebarMenuButton asChild>
                            <Link to={navItem.route}>
                              <IconComponent className="h-4 w-4" />
                              <span>{navItem.key.charAt(0).toUpperCase() + navItem.key.slice(1)}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarContent>
              </Sidebar>
              <main className="flex-1 p-6">
                <SidebarTrigger className="mb-4" />
                <Outlet />
              </main>
            </div>
          </SidebarProvider>
        </div>
      </FeatureGate>
      
      {/* Fallback for when both navigation types are disabled */}
      {!isFeatureEnabled('navigation.sidebar') && !isFeatureEnabled('navigation.bottomAppBar') && (
        <div className="min-h-screen bg-background">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">DSVI Admin</h1>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
}

export default FeatureAwareDSVIAdminLayout;