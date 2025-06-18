import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  year_established?: number | null;
  permit_url?: string | null;
}

export default function SchoolsPage() {
  const { 
    isLevel1Admin, 
    isLevel2Admin, 
    hasPermission, 
    hasSchoolAccess, 
    assignedSchools,
    adminLevel,
    loading: adminLoading,
    refreshAdminData
  } = useAdmin();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const { toast } = useToast();

  // Check if user has permission to access schools - memoized to prevent infinite loops
  const hasSchoolsAccess = useMemo(() => {
    return hasPermission(PERMISSION_TYPES.CMS_ACCESS);
  }, [hasPermission]);

  const fetchSchools = useCallback(async () => {
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

      setSchools(data as School[] || []); // Cast data to School[] to resolve TypeScript error
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
  }, [isLevel2Admin, assignedSchools, toast]);

  useEffect(() => {
    // Attempt one refresh for newly signed up Level 2 admins
    if (!adminLoading && adminLevel === null && !hasAttemptedRefresh) {
      const activatedAdmins = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
      const userEmail = supabase?.auth?.getUser()?.then(({ data }) => data?.user?.email?.toLowerCase());
      
      userEmail?.then(email => {
        if (email && activatedAdmins.includes(email)) {
          console.log('Recently activated Level 2 admin detected, attempting refresh...');
          setHasAttemptedRefresh(true);
          setTimeout(() => {
            refreshAdminData();
          }, 2000);
        }
      });
    }
  }, [adminLoading, adminLevel, hasAttemptedRefresh, refreshAdminData]);

  useEffect(() => {
    // Only fetch schools when we have determined access
    if (!adminLoading && (isLevel1Admin || (isLevel2Admin && hasSchoolsAccess))) {
      fetchSchools();
    }
    
    // Listen for add school dialog event from bottom app bar
    const handleOpenAddDialog = () => setShowAddDialog(true);
    window.addEventListener('openAddSchoolDialog', handleOpenAddDialog);
    
    return () => {
      window.removeEventListener('openAddSchoolDialog', handleOpenAddDialog);
    };
  }, [adminLoading, isLevel1Admin, isLevel2Admin, hasSchoolsAccess, fetchSchools]);

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

  const generateSchoolWebsiteUrl = (school: School) => {
    // Use the school's slug if available, otherwise create one from the name
    const slug = school.slug || school.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return generateSchoolHomepageUrl(slug);
  };

  const handleSchoolAdded = useCallback(() => {
    fetchSchools();
    setShowAddDialog(false);
  }, [fetchSchools]);

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
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error only if admin level cannot be determined after attempts
  if (adminLevel === null && hasAttemptedRefresh) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground text-red-600">Unable to verify admin permissions.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Your admin level could not be determined. This might happen if:
            </p>
            <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto mb-6">
              <li>• You just signed up and the system is still processing</li>
              <li>• There was a temporary connection issue</li>
              <li>• Your admin profile needs to be manually created</li>
            </ul>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              If the issue persists, please contact your administrator.
            </p>
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
            <p className="text-muted-foreground text-red-600">You don't have permission to access schools.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
            <p className="text-muted-foreground">Contact your Level 1 administrator for access.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading for school data
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">
              {isLevel2Admin 
                ? `Managing ${assignedSchools.length} assigned school${assignedSchools.length !== 1 ? 's' : ''}`
                : 'Manage all schools in the system'
              }
            </p>
          </div>
          {isLevel1Admin && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Mobile view
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="pb-20">
        <MobileTopBar title="Schools" />
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredSchools.map((school) => (
              <MobileCard key={school.id} title={school.name}>
                <div className="p-4">
                  <a
                    href={generateSchoolWebsiteUrl(school)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors font-semibold text-lg mb-2"
                  >
                    {school.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getSubscriptionStatusBadge(school.subscription_status, school.subscription_end)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Package</span>
                      {getPackageTypeBadge(school.package_type)}
                    </div>
                    {school.subscription_end && (
                      <p className="text-sm text-muted-foreground">
                        {formatDaysUntilExpiry(school.subscription_end)}
                      </p>
                    )}
                    {school.year_established && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Year Est.</span>
                        <span className="text-sm">{school.year_established}</span>
                      </div>
                    )}
                    {school.permit_url && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Permit</span>
                        <a 
                          href={school.permit_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Permit
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                        <Link to={`/dsvi-admin/schools/${school.id}/content`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Page
                        </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link to={`/dsvi-admin/schools/${school.id}/content`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Page
                      </Link>
                    </Button>
                    {!school.admin_user_id && isLevel1Admin && (
                      <Button
                        onClick={() => handleInviteAdmin(school)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                    )}
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>

        {isLevel1Admin && (
          <>
            <AddSchoolDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSchoolAdded={handleSchoolAdded} />
            <InviteSchoolAdminDialog
              open={showInviteDialog}
              onOpenChange={setShowInviteDialog}
              school={selectedSchool}
            />
          </>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">
            {isLevel2Admin 
              ? `Managing ${assignedSchools.length} assigned school${assignedSchools.length !== 1 ? 's' : ''}`
              : 'Manage all schools in the system'
            }
          </p>
        </div>
        {isLevel1Admin && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Schools</CardTitle>
              <CardDescription>
                {isLevel2Admin 
                  ? 'Schools you have been assigned to manage'
                  : 'All schools in the system'
                }
              </CardDescription>
            </div>
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Year Est.</TableHead>
                <TableHead>Permit</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">
                    <a
                      href={generateSchoolWebsiteUrl(school)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {school.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {getSubscriptionStatusBadge(school.subscription_status, school.subscription_end)}
                  </TableCell>
                  <TableCell>
                    {getPackageTypeBadge(school.package_type)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDaysUntilExpiry(school.subscription_end)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {school.year_established || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {school.permit_url ? (
                      <a 
                        href={school.permit_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        View Permit
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {school.admin_user_id ? (
                      <Badge variant="outline" className="bg-green-50">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link to={`/dsvi-admin/schools/${school.id}/content`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Page
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link to={`/dsvi-admin/schools/${school.id}/settings`}>
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Link>
                      </Button>
                      {!school.admin_user_id && isLevel1Admin && (
                        <Button
                          onClick={() => handleInviteAdmin(school)}
                          variant="outline"
                          size="sm"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Invite Admin
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isLevel1Admin && (
        <>
          <AddSchoolDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSchoolAdded={handleSchoolAdded} />
          <InviteSchoolAdminDialog
            open={showInviteDialog}
            onOpenChange={setShowInviteDialog}
            school={selectedSchool}
          />
        </>
      )}
    </div>
  );
}