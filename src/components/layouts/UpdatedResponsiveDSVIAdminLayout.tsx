import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeature } from '@/contexts/FeatureFlagContext';
import { Button } from '@/components/ui/button';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { School, LogOut, Users, BarChart3, CreditCard, MessageSquare, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UpdatedResponsiveDSVIAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Feature flag checks with fallback to true (non-destructive)
  let isDashboardEnabled = true;
  let isSchoolsEnabled = true;
  let isRequestsEnabled = true;
  let isSubscriptionsEnabled = true;
  let isMessagingEnabled = true;

  try {
    isDashboardEnabled = useFeature('dashboard');
    isSchoolsEnabled = useFeature('schools'); 
    isRequestsEnabled = useFeature('requests');
    isSubscriptionsEnabled = useFeature('subscriptions');
    isMessagingEnabled = useFeature('messaging');
  } catch (error) {
    // If feature flag system is not available, show everything (non-destructive)
    console.warn('Feature flag system not available, showing all navigation items');
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Layout with Bottom App Bar */}
      <div className="md:hidden min-h-screen bg-background">
        <main className="pb-20">
          <Outlet />
        </main>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>

      {/* Desktop Layout with Sidebar */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <Sidebar>
              <SidebarHeader className="p-4">
                <h2 className="text-lg font-semibold">DSVI Admin</h2>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {isDashboardEnabled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/dashboard">
                          <BarChart3 className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isSchoolsEnabled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/schools">
                          <School className="h-4 w-4" />
                          <span>Schools</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isRequestsEnabled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/requests">
                          <Users className="h-4 w-4" />
                          <span>School Requests</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isSubscriptionsEnabled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/subscriptions">
                          <CreditCard className="h-4 w-4" />
                          <span>Subscriptions</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isMessagingEnabled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/messaging">
                          <MessageSquare className="h-4 w-4" />
                          <span>Messaging</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  <SidebarSeparator />
                  
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
    </>
  );
}
