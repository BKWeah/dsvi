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

interface Level2Admin {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
  notes: string | null;
  permissions: string[];
  assigned_schools: string[];
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
      
      // Fetch Level 2 admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('admin_profiles')
        .select(`
          id,
          user_id,
          admin_level,
          created_at,
          is_active,
          notes
        `)
        .eq('admin_level', ADMIN_LEVELS.ASSIGNED_STAFF)
        .eq('is_active', true);

      if (adminsError) throw adminsError;

      // For each admin, get their auth user info, permissions, and assignments
      const level2AdminsWithDetails = await Promise.all(
        (adminsData || []).map(async (adminProfile) => {
          try {
            // Get permissions
            const { data: permissions } = await supabase
              .from('admin_permissions')
              .select('permission_type, resource_id')
              .eq('admin_user_id', adminProfile.user_id)
              .eq('is_active', true);

            // Get school assignments
            const { data: assignments } = await supabase
              .from('admin_assignments')
              .select('school_id')
              .eq('admin_user_id', adminProfile.user_id)
              .eq('is_active', true);

            return {
              id: adminProfile.user_id,
              email: `user-${adminProfile.user_id.slice(0, 8)}`, // Placeholder
              name: `Admin ${adminProfile.user_id.slice(0, 8)}`, // Placeholder
              created_at: adminProfile.created_at,
              is_active: adminProfile.is_active,
              notes: adminProfile.notes,
              permissions: permissions?.map(p => p.permission_type) || [],
              assigned_schools: assignments?.map(a => a.school_id) || []
            };
          } catch (error) {
            console.error('Error fetching admin details:', error);
            return null;
          }
        })
      );

      setLevel2Admins(level2AdminsWithDetails.filter(Boolean) as Level2Admin[]);

      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, slug')
        .order('name');

      if (schoolsError) throw schoolsError;

      setSchools(schoolsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
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

    // Check for duplicate email invitations
    try {
      const existingPending = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
      const duplicateInvite = existingPending.find((invite: any) => 
        invite.email.toLowerCase() === newAdminEmail.toLowerCase()
      );
      
      if (duplicateInvite) {
        toast({
          title: "Duplicate Invitation",
          description: `An invitation for ${newAdminEmail} already exists. Delete the existing one first if you want to create a new invitation.`,
          variant: "destructive",
        });
        return;
      }

      // Check if email already has an active Level 2 admin account
      const activatedAdmins = JSON.parse(localStorage.getItem('activatedLevel2Admins') || '[]');
      if (activatedAdmins.includes(newAdminEmail.toLowerCase())) {
        toast({
          title: "Account Exists",
          description: `${newAdminEmail} already has an active Level 2 admin account.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }

    try {
      // Generate secure invitation data
      const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}`;
      const inviteToken = `invite_${Date.now()}_${Math.random().toString(36).slice(-8)}`;
      const currentTimestamp = new Date().toISOString();
      
      // Create email hash for URL (use full base64, don't truncate)
      console.log('Original email for encoding:', newAdminEmail);
      const emailHash = btoa(newAdminEmail);
      console.log('Encoded email hash:', emailHash);
      console.log('Decoded email hash (verification):', atob(emailHash));
      
      // Generate the signup link with email hash
      const baseUrl = window.location.origin;
      const signupLink = `${baseUrl}/level2-admin-signup?token=${encodeURIComponent(inviteToken)}&eh=${emailHash}&pwd=${encodeURIComponent(tempPassword)}&name=${encodeURIComponent(newAdminName)}`;

      // Store the pending admin configuration with invite token
      const pendingAdminData = {
        email: newAdminEmail,
        name: newAdminName,
        notes: newAdminNotes,
        permissions: selectedPermissions,
        schools: selectedSchools,
        tempPassword: tempPassword,
        inviteToken: inviteToken,
        emailHash: emailHash,
        signupLink: signupLink,
        createdBy: user?.id,
        createdAt: currentTimestamp,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      };

      // Store in localStorage for now (in production, you'd store this in a pending_admins table)
      const existingPending = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
      existingPending.push(pendingAdminData);
      localStorage.setItem('pendingLevel2Admins', JSON.stringify(existingPending));

      console.log('Level 2 Admin Invitation Created and Stored:', pendingAdminData);
      console.log('Updated localStorage pendingLevel2Admins:', existingPending);

      // Verify storage worked
      const verifyStorage = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
      console.log('Verification - localStorage now contains:', verifyStorage.length, 'invitations');

      // Prepare data for success dialog
      setLastInvitationData({
        email: newAdminEmail,
        name: newAdminName,
        signupLink: signupLink,
        permissions: selectedPermissions,
        schools: selectedSchools,
        tempPassword: tempPassword,
        expiresAt: pendingAdminData.expiresAt
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
          description: "Signup link copied to clipboard automatically",
        });
      } catch (clipboardError) {
        toast({
          title: "Invitation Created!",
          description: "Use the dialog to copy and send the signup link",
        });
      }

      // Refresh data to show any newly created admins
      fetchData();

    } catch (error) {
      console.error('Error creating admin invitation:', error);
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
                            <span>Permissions: {admin.permissions.length}</span>
                            <span>Schools: {admin.assigned_schools.length}</span>
                          </div>
                          {admin.notes && (
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {admin.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
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
                            {admin.assigned_schools.slice(0, 2).map((schoolId) => {
                              const school = schools.find(s => s.id === schoolId);
                              return (
                                <Badge key={schoolId} variant="outline" className="text-xs">
                                  <School className="h-3 w-3 mr-1" />
                                  {school?.name || 'Unknown'}
                                </Badge>
                              );
                            })}
                            {admin.assigned_schools.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{admin.assigned_schools.length - 2} more
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
