import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
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
import { School, LogOut, Users, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResponsiveDSVIAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine page title and subtitle based on current route
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path.includes('/requests')) {
      return { title: 'School Requests', subtitle: 'Review applications' };
    } else if (path.includes('/schools')) {
      return { title: 'Schools', subtitle: 'Manage all schools' };
    } else {
      return { title: 'DSVI Admin', subtitle: 'Manage schools' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-background">
        <MobileTopBar 
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          showBackButton={false}
          leftContent={
            <MobileNavigation 
              userRole="DSVI_ADMIN" 
              onLogout={handleLogout}
            />
          }
        />
        <main className="p-4 pb-20">
          <Outlet />
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <Sidebar>
              <SidebarHeader className="p-4">
                <h2 className="text-lg font-semibold">DSVI Admin</h2>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dsvi-admin/schools">
                        <School className="h-4 w-4" />
                        <span>Schools</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dsvi-admin/requests">
                        <Users className="h-4 w-4" />
                        <span>School Requests</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
