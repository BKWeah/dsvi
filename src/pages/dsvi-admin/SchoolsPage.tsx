
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/lib/admin/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, ExternalLink, Edit, Settings, UserPlus, Search, Lock } from 'lucide-react';
import { AddSchoolDialog } from '@/components/dsvi-admin/AddSchoolDialog';
import { InviteSchoolAdminDialog } from '@/components/dsvi-admin/InviteSchoolAdminDialog';
import { MobileCard } from '@/components/mobile/MobileCard';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { useToast } from '@/hooks/use-toast';
import { generateSchoolHomepageUrl } from '@/lib/subdomain-utils';
import { PERMISSION_TYPES, RESTRICTED_PERMISSIONS } from '@/lib/admin/permissions';

interface School {
  id: string;
  name: string;
  admin_user_id: string | null;
  slug?: string;
  package_type?: string;
  subscription_status?: string;
  subscription_end?: string;
}

export default function SchoolsPage() {
  const { 
    isLevel1Admin, 
    isLevel2Admin, 
    hasPermission, 
    hasSchoolAccess, 
    assignedSchools,
    adminLevel,
    loading: adminLoading 
  } = useAdmin();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { toast } = useToast();

  // Check if user has permission to access schools
  const hasSchoolsAccess = hasPermission(PERMISSION_TYPES.CMS_ACCESS);
  
  useEffect(() => {
    // Only fetch schools when admin loading is complete AND we have a valid admin level
    if (!adminLoading && adminLevel !== null && hasSchoolsAccess) {
      fetchSchools();
    }
    
    // Listen for add school dialog event from bottom app bar
    const handleOpenAddDialog = () => setShowAddDialog(true);
    window.addEventListener('openAddSchoolDialog', handleOpenAddDialog);
    
    return () => {
      window.removeEventListener('openAddSchoolDialog', handleOpenAddDialog);
    };
  }, [adminLoading, adminLevel, assignedSchools, hasSchoolsAccess]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true });

      // Level 2 admins only see their assigned schools
      if (isLevel2Admin && assignedSchools.length > 0) {
        query = query.in('id', assignedSchools);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [schools, searchQuery]);

  const getSubscriptionStatusBadge = (status: string | undefined, endDate: string | undefined) => {
    if (!status) return <Badge variant="secondary">No Status</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPackageTypeBadge = (packageType: string | undefined) => {
    if (!packageType) return <Badge variant="outline">Standard</Badge>;
    
    switch (packageType) {
      case 'advanced':
        return <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>;
      case 'standard':
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const formatDaysUntilExpiry = (endDate: string | undefined) => {
    if (!endDate) return 'No expiry date';
    
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry === 0) {
      return 'Expires today';
    } else if (daysUntilExpiry === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${daysUntilExpiry} days`;
    }
  };

  const handleSchoolAdded = () => {
    fetchSchools();
    setShowAddDialog(false);
  };

  const handleInviteAdmin = (school: School) => {
    setSelectedSchool(school);
    setShowInviteDialog(true);
  };

  // Show loading while admin level is being determined
  if (adminLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">Loading admin permissions...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error if admin level couldn't be determined
  if (adminLevel === null) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground text-red-600">Admin level could not be determined. Please contact support.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Unable to access schools management.</p>
            <p className="text-sm text-muted-foreground">If you just signed up, please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to access schools
  if (!hasSchoolsAccess) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">Access denied</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have permission to access schools management.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">Loading schools...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">Manage all schools in the DSVI platform</p>
        </div>
        {/* Only show Add button on desktop */}
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New School
        </Button>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge variant="outline">
              {filteredSchools.length} total
            </Badge>
            <Badge variant="secondary">
              {schools.filter(s => s.admin_user_id).length} with admin
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {schools.filter(s => s.subscription_status === 'active').length} active
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              {schools.filter(s => s.subscription_status === 'expiring').length} expiring
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              {schools.filter(s => s.subscription_status === 'inactive').length} inactive
            </Badge>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
            <CardDescription>
              List of all schools registered in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      {school.admin_user_id ? (
                        <span className="text-green-600 text-sm">✓ Admin Assigned</span>
                      ) : (
                        <span className="text-orange-600 text-sm">⚠ No Admin</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              school.subscription_status === 'active' ? 'default' :
                              school.subscription_status === 'expiring' ? 'secondary' :
                              school.subscription_status === 'inactive' ? 'destructive' : 'outline'
                            }
                            className="text-xs"
                          >
                            {(school.subscription_status || 'pending').replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(school.package_type || 'standard').toUpperCase()}
                          </Badge>
                        </div>
                        {school.subscription_end && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {new Date(school.subscription_end).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dsvi-admin/schools/${school.id}/content`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Content
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dsvi-admin/schools/${school.id}/settings`}>
                            <Settings className="h-4 w-4 mr-1" />
                            Settings
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleInviteAdmin(school)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Invite Admin
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={generateSchoolHomepageUrl(school.slug)} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Site
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredSchools.map((school) => (
          <MobileCard
            key={school.id}
            title={school.name}
            subtitle={`ID: ${school.id.slice(0, 8)}...`}
            status={{
              label: school.admin_user_id ? "Admin Assigned" : "No Admin",
              variant: school.admin_user_id ? "default" : "secondary"
            }}
            actions={[
              {
                label: "Edit",
                icon: <Edit className="h-3 w-3" />,
                onClick: () => window.open(`/dsvi-admin/schools/${school.id}/content`, '_self')
              },
              {
                label: "Settings", 
                icon: <Settings className="h-3 w-3" />,
                onClick: () => window.open(`/dsvi-admin/schools/${school.id}/settings`, '_self')
              },
              {
                label: "Invite",
                icon: <UserPlus className="h-3 w-3" />,
                onClick: () => handleInviteAdmin(school)
              }
            ]}
          />
        ))}
      </div>

      {filteredSchools.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No schools found matching your search.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <AddSchoolDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSchoolAdded={handleSchoolAdded}
      />

      <InviteSchoolAdminDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        school={selectedSchool}
      />
    </div>
  );
}
