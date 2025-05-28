import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  FileEdit, 
  LogOut, 
  Home, 
  Info, 
  GraduationCap, 
  UserCheck, 
  Users, 
  Phone 
} from 'lucide-react';

const PAGE_TYPES = [
  { type: 'homepage', label: 'Homepage', icon: Home },
  { type: 'about-us', label: 'About Us', icon: Info },
  { type: 'academics', label: 'Academics', icon: GraduationCap },
  { type: 'admissions', label: 'Admissions', icon: UserCheck },
  { type: 'faculty', label: 'Faculty', icon: Users },
  { type: 'contact', label: 'Contact', icon: Phone }
];

export function ResponsiveSchoolAdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchSchool();
    }
  }, [user]);

  const fetchSchool = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('name')
        .eq('admin_user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSchoolName(data.name);
      }
    } catch (error) {
      console.error('Error fetching school:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-background">
        <MobileTopBar 
          title="School CMS"
          subtitle={schoolName || "Manage your school"}
          showBackButton={false}
          leftContent={
            <MobileNavigation 
              userRole="SCHOOL_ADMIN" 
              schoolName={schoolName}
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
                <h2 className="text-lg font-semibold">School CMS</h2>
                {schoolName && (
                  <p className="text-sm text-muted-foreground">{schoolName}</p>
                )}
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {PAGE_TYPES.map((pageType) => {
                    const Icon = pageType.icon;
                    return (
                      <SidebarMenuItem key={pageType.type}>
                        <SidebarMenuButton asChild>
                          <Link to={`/school-admin/pages/${pageType.type}/edit`}>
                            <Icon className="h-4 w-4" />
                            <span>Edit {pageType.label}</span>
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
    </>
  );
}
