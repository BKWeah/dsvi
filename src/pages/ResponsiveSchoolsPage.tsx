import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, ExternalLink, Edit, Settings, UserPlus, Search, Grid, List } from 'lucide-react';
import { AddSchoolDialog } from '@/components/dsvi-admin/AddSchoolDialog';
import { InviteSchoolAdminDialog } from '@/components/dsvi-admin/InviteSchoolAdminDialog';
import { MobileCard } from '@/components/mobile/MobileCard';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  admin_user_id: string | null;
  slug?: string;
}

type MobileCardAction = {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  onClick?: () => void;
  href?: string;
};

export default function ResponsiveSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { toast } = useToast();

  const fetchSchoolsData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    setSchools(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchoolsData();

    const subscription = supabase
      .channel('public:schools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, payload => {
        fetchSchoolsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);

  useEffect(() => {
    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [schools, searchQuery]);

  const handleSchoolAdded = () => {
    fetchSchoolsData();
    setShowAddDialog(false);
  };

  const handleInviteAdmin = (school: School) => {
    setSelectedSchool(school);
    setShowInviteDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schools Management</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add School
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
            <CardDescription>A comprehensive list of all registered schools.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      {school.admin_user_id ? (
                        <Badge variant="secondary">Admin Assigned</Badge>
                      ) : (
                        <Badge variant="outline">No Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link to={`/dsvi-admin/schools/${school.id}/settings`}>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" /> Settings
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleInviteAdmin(school)}>
                          <UserPlus className="h-4 w-4 mr-2" /> Invite Admin
                        </Button>
                        {school.slug && (
                          <a href={`http://${school.slug}.localhost:8000`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" /> Visit Site
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((school) => (
            <MobileCard
              key={school.id}
              title={school.name}
              subtitle={school.admin_user_id ? 'Admin Assigned' : 'No Admin'}
              actions={[
                {
                  label: 'Settings',
                  icon: <Settings className="h-4 w-4" />,
                  variant: 'outline' as MobileCardAction['variant'],
                  href: `/dsvi-admin/schools/${school.id}/settings`,
                },
                {
                  label: 'Invite Admin',
                  icon: <UserPlus className="h-4 w-4" />,
                  variant: 'outline' as MobileCardAction['variant'],
                  onClick: () => handleInviteAdmin(school),
                },
                ...(school.slug
                  ? [
                      {
                        label: 'Visit Site',
                        icon: <ExternalLink className="h-4 w-4" />,
                        variant: 'outline' as MobileCardAction['variant'],
                        href: `http://${school.slug}.localhost:8000`,
                      },
                    ]
                  : []),
              ]}
            />
          ))}
        </div>
      )}

      <AddSchoolDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSchoolAdded={handleSchoolAdded}
      />
      {selectedSchool && (
        <InviteSchoolAdminDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          school={selectedSchool}
        />
      )}
    </div>
  );
}
