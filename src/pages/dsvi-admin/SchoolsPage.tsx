
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ExternalLink, Edit } from 'lucide-react';
import { AddSchoolDialog } from '@/components/dsvi-admin/AddSchoolDialog';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  admin_user_id: string | null;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

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

  const handleSchoolAdded = () => {
    fetchSchools();
    setShowAddDialog(false);
  };

  if (loading) {
    return <div>Loading schools...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">Manage all schools in the DSVI platform</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New School
        </Button>
      </div>

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
                <TableHead>Slug</TableHead>
                <TableHead>Logo URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.slug}</TableCell>
                  <TableCell>{school.logo_url || 'No logo'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dsvi-admin/schools/${school.id}/content`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Content
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/s/${school.slug}/homepage`} target="_blank">
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

      <AddSchoolDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSchoolAdded={handleSchoolAdded}
      />
    </div>
  );
}
