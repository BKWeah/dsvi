import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, ExternalLink, Edit, Settings, UserPlus, Search } from 'lucide-react';
import { MobileCard } from '@/components/mobile/MobileCard';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';
import { AddSchoolDialog } from '@/components/dsvi-admin/AddSchoolDialog';
import { InviteSchoolAdminDialog } from '@/components/dsvi-admin/InviteSchoolAdminDialog';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  admin_user_id: string | null;
  slug?: string;
}

export default function EnhancedMobileSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [schools, searchQuery]);

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

  const handleInviteAdmin = (school: School) => {
    setSelectedSchool(school);
    setShowInviteDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar title="Schools" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64 p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schools...</p>
          </div>
        </div>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileTopBar 
        title="Schools Management"
        subtitle={`${filteredSchools.length} schools`}
        actionButton={{
          label: "Add",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setShowAddDialog(true)
        }}
      />
      
      <div className="p-4 pb-24 space-y-4">
        {/* Search Section */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredSchools.length} total
              </Badge>
              <Badge variant="secondary">
                {schools.filter(s => s.admin_user_id).length} with admin
              </Badge>
            </div>
          </div>
        </div>

        {/* Schools List */}
        <div className="space-y-3">
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
                  label: "Content",
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
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No schools found matching your search.</p>
          </div>
        )}
      </div>

      <BottomAppBar userRole="DSVI_ADMIN" />

      {/* Dialogs */}
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
