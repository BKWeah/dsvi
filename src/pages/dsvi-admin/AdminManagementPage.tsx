import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { InvitationSuccessDialog } from '@/components/dsvi-admin/InvitationSuccessDialog';
import { PendingInvitations } from '@/components/dsvi-admin/PendingInvitations';
import { ViewAdminDialog } from '@/components/dsvi-admin/ViewAdminDialog';
import { EditAdminDialog } from '@/components/dsvi-admin/EditAdminDialog';
import { AdminMigrationUtility } from '@/components/admin/AdminMigrationUtility';
import { AdminDebugUtility } from '@/components/admin/AdminDebugUtility';
import { 
  UserPlus, 
  Settings, 
  Users, 
  Eye,
  Trash2,
  School,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  PERMISSION_TYPES, 
  PERMISSION_GROUPS, 
  PERMISSION_DESCRIPTIONS,
  ADMIN_LEVELS,
  AdminProfile 
} from '@/lib/admin/permissions';

// Define the expected structure of the RPC result for create_admin_invitation
interface CreateInvitationRpcResult {
  success: boolean;
  message?: string;
  error?: string;
  invitation_id?: string;
  email?: string;
  name?: string;
  invite_token?: string;
  email_hash?: string;
  temp_password?: string;
  signup_link?: string;
  expires_at?: string;
}

// Updated interface for the new consolidated admin table
interface Level2Admin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  admin_level: number;
  permissions: string[];
  school_ids: string[];
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  permissions_count: number;
  schools_count: number;
}

interface School {
  id: string;
  name: string;
  slug: string;
}

export default function AdminManagementPage() {
  const { user } = useAuth();
  const { isLevel1Admin, loading: adminLoading } = useAdmin();
  const [level2Admins, setLevel2Admins] = useState<Level2Admin[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Level2Admin | null>(null);
  const [lastInvitationData, setLastInvitationData] = useState<any>(null);
  const { toast } = useToast();

  // Form states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminNotes, setNewAdminNotes] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    if (!adminLoading && isLevel1Admin) {
      fetchData();
    }
  }, [adminLoading, isLevel1Admin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching Level 2 admins from new consolidated table...');
      
      // Fetch Level 2 admins using the new list function
      const { data: adminsData, error: adminsError } = await supabase.rpc('list_level2_admins');

      if (adminsError) {
        console.error('❌ Error fetching admins:', adminsError);
        throw adminsError;
      }

      console.log('✅ Fetched admins:', adminsData);
      setLevel2Admins(adminsData || []);

      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, slug')
        .order('name');

      if (schoolsError) {
        console.error('❌ Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      console.log('✅ Fetched schools:', schoolsData?.length || 0);
      setSchools(schoolsData || []);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLevel2Admin = async () => {
    if (!newAdminEmail || !newAdminName) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Creating Level 2 admin invitation...');
      
      // Use the existing database function for creating invitations
      const { data: rpcResult, error: invitationError } = await supabase.rpc('create_admin_invitation' as any, {
        p_email: newAdminEmail,
        p_name: newAdminName,
        p_created_by: user?.id,
        p_permissions: selectedPermissions,
        p_school_ids: selectedSchools,
        p_notes: newAdminNotes,
        p_days_valid: 7
      });

      const invitationResult: CreateInvitationRpcResult | null = rpcResult;

      if (invitationError) {
        console.error('❌ Database invitation creation failed:', invitationError);
        toast({
          title: "Error",
          description: "Failed to create invitation in database",
          variant: "destructive",
        });
        return;
      }

      if (!invitationResult?.success) {
        console.error('❌ Invitation creation returned failure:', invitationResult);
        toast({
          title: "Error", 
          description: invitationResult?.message || "Failed to create invitation",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Database invitation created successfully:', invitationResult);
      
      // Extract values from invitation result
      const emailHash = invitationResult.email_hash;
      const inviteToken = invitationResult.invite_token;
      const tempPassword = invitationResult.temp_password;
      
      const signupLink = invitationResult.signup_link || `${window.location.origin}/level2-admin-signup?token=${encodeURIComponent(inviteToken || '')}&eh=${encodeURIComponent(emailHash || '')}&pwd=${encodeURIComponent(tempPassword || '')}&name=${encodeURIComponent(newAdminName)}`;

      // Prepare data for success dialog
      setLastInvitationData({
        email: newAdminEmail,
        name: newAdminName,
        signupLink: signupLink,
        permissions: selectedPermissions,
        schools: selectedSchools,
        tempPassword: tempPassword,
        expiresAt: invitationResult.expires_at,
        inviteToken: inviteToken
      });

      // Reset form
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminNotes('');
      setSelectedPermissions([]);
      setSelectedSchools([]);
      setShowCreateDialog(false);

      // Show success dialog
      setShowSuccessDialog(true);

      // Copy link to clipboard automatically
      try {
        await navigator.clipboard.writeText(signupLink);
        toast({
          title: "Invitation Created!",
          description: "Signup link copied to clipboard and stored in database",
        });
      } catch (clipboardError) {
        toast({
          title: "Invitation Created!",
          description: "Invitation stored in database - use the dialog to copy the signup link",
        });
      }

      // Refresh data to show any newly created admins
      fetchData();

    } catch (error) {
      console.error('❌ Error creating database invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create Level 2 admin invitation",
        variant: "destructive",
      });
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(s => s !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleViewAdmin = (admin: Level2Admin) => {
    setSelectedAdmin(admin);
    setShowViewDialog(true);
  };

  const handleEditAdmin = (admin: Level2Admin) => {
    setSelectedAdmin(admin);
    setShowEditDialog(true);
  };

  const handleEditFromView = () => {
    setShowViewDialog(false);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    fetchData(); // Refresh the data
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLevel1Admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Only Level 1 (Super Admin) users can access admin management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">Manage Level 2 (Assigned Staff) administrators</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Level 2 Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Level 2 Admin</DialogTitle>
              <DialogDescription>
                Create a new Level 2 (Assigned Staff) administrator with specific permissions and school assignments.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Admin Name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newAdminNotes}
                  onChange={(e) => setNewAdminNotes(e.target.value)}
                  placeholder="Additional notes about this admin..."
                />
              </div>

              {/* Permissions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permissions</h3>
                {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                  <Card key={groupName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium capitalize">
                        {groupName.toLowerCase()} Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {permissions.map((permission) => (
                        <div key={permission} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={permission}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* School Assignments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">School Assignments</h3>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Assign Schools
                    </CardTitle>
                    <CardDescription>
                      Select which schools this admin can manage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {schools.map((school) => (
                        <div key={school.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={school.id}
                            checked={selectedSchools.includes(school.id)}
                            onCheckedChange={() => toggleSchool(school.id)}
                          />
                          <label
                            htmlFor={school.id}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {school.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createLevel2Admin}>
                  Create Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Level 2 Admins */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Level 2 Admins ({level2Admins.length})
            </CardTitle>
            <CardDescription>
              Assigned staff with limited administrative permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {level2Admins.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Level 2 Admins</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any Level 2 (Assigned Staff) administrators yet.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create First Level 2 Admin
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {level2Admins.map((admin) => (
                  <Card key={admin.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{admin.name}</h4>
                            <Badge variant="secondary">Level 2</Badge>
                            {admin.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Created: {new Date(admin.created_at).toLocaleDateString()}</span>
                            <span>Permissions: {admin.permissions_count || 0}</span>
                            <span>Schools: {admin.schools_count || 0}</span>
                            {admin.last_login && (
                              <span>Last Login: {new Date(admin.last_login).toLocaleDateString()}</span>
                            )}
                          </div>
                          {admin.notes && (
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {admin.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewAdmin(admin)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                      
                      {/* Quick preview of permissions and schools */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Key Permissions</h5>
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                            {admin.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{admin.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Assigned Schools</h5>
                          <div className="flex flex-wrap gap-1">
                            {admin.school_ids.slice(0, 2).map((schoolId) => {
                              const school = schools.find(s => s.id === schoolId);
                              return (
                                <Badge key={schoolId} variant="outline" className="text-xs">
                                  <School className="h-3 w-3 mr-1" />
                                  {school?.name || 'Unknown'}
                                </Badge>
                              );
                            })}
                            {admin.school_ids.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{admin.school_ids.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations Section */}
      <PendingInvitations onRefresh={fetchData} />

      {/* Admin Migration Utility */}
      <AdminMigrationUtility />

      {/* Admin Debug Utility */}
      <AdminDebugUtility />

      {/* View Admin Dialog */}
      <ViewAdminDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        admin={selectedAdmin}
        schools={schools}
        onEdit={handleEditFromView}
      />

      {/* Edit Admin Dialog */}
      <EditAdminDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        admin={selectedAdmin}
        schools={schools}
        onSave={handleSaveEdit}
      />

      {/* Invitation Success Dialog */}
      {lastInvitationData && (
        <InvitationSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          invitationData={lastInvitationData}
        />
      )}
    </div>
  );
}
