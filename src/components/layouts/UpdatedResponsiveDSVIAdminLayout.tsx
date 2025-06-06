import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { useAdminProfileVerification } from '@/hooks/useAdminProfileVerification';
import { useFeature } from '@/contexts/FeatureFlagContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  School, 
  LogOut, 
  Users, 
  BarChart3, 
  CreditCard, 
  MessageSquare, 
  Settings2,
  UserCog,
  Crown,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PERMISSION_TYPES, RESTRICTED_PERMISSIONS } from '@/lib/admin/permissions';

export function UpdatedResponsiveDSVIAdminLayout() {
  const { logout, user } = useAuth();
  const { 
    adminLevel, 
    isLevel1Admin, 
    isLevel2Admin, 
    hasPermission, 
    loading: adminLoading 
  } = useAdmin();
  const navigate = useNavigate();
  
  // Auto-verify and fix admin profile if needed
  useAdminProfileVerification();

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

  // Helper function to check if user can access a feature
  const canAccessFeature = (permission: string, restrictedPermission?: string) => {
    if (adminLoading) return false;
    
    // If it's a restricted permission, only Level 1 admins can access
    if (restrictedPermission && !isLevel1Admin) return false;
    
    // Level 1 admins can access everything
    if (isLevel1Admin) return true;
    
    // Level 2 admins need specific permissions
    if (isLevel2Admin) return hasPermission(permission);
    
    return false;
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">DSVI Admin</h2>
                  <div className="flex items-center gap-2">
                    {isLevel1Admin ? (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Level 1 (Super Admin)
                      </Badge>
                    ) : isLevel2Admin ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Level 2 (Assigned Staff)
                      </Badge>
                    ) : (
                      <Badge variant="outline">Admin</Badge>
                    )}
                  </div>
                </div>
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
                  {isSchoolsEnabled && canAccessFeature(PERMISSION_TYPES.CMS_ACCESS) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/schools">
                          <School className="h-4 w-4" />
                          <span>Schools</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isRequestsEnabled && canAccessFeature(PERMISSION_TYPES.CMS_ACCESS, RESTRICTED_PERMISSIONS.APPROVE_SCHOOL_REQUESTS) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/requests">
                          <Users className="h-4 w-4" />
                          <span>School Requests</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isSubscriptionsEnabled && canAccessFeature(PERMISSION_TYPES.SUBSCRIPTION_VIEW) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/subscriptions">
                          <CreditCard className="h-4 w-4" />
                          <span>Subscriptions</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isMessagingEnabled && canAccessFeature(PERMISSION_TYPES.MESSAGING) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dsvi-admin/messaging">
                          <MessageSquare className="h-4 w-4" />
                          <span>Messaging</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* Admin Management - Level 1 Only */}
                  {isLevel1Admin && (
                    <>
                      <SidebarSeparator />
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/dsvi-admin/admin-management">
                            <UserCog className="h-4 w-4" />
                            <span>Admin Management</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/dsvi-admin/admin-test">
                            <Settings2 className="h-4 w-4" />
                            <span>Test Admin System</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
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
