import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  SidebarTrigger
} from '@/components/ui/sidebar';
import { School, LogOut, Users, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UpdatedResponsiveDSVIAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
