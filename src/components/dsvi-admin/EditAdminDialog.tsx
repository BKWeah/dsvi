import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User,
  Shield,
  School,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { 
  PERMISSION_TYPES, 
  PERMISSION_GROUPS, 
  PERMISSION_DESCRIPTIONS 
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

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Level2Admin | null;
  schools: School[];
  onSave: () => void;
}

export function EditAdminDialog({ 
  open, 
  onOpenChange, 
  admin,
  schools,
  onSave
}: EditAdminDialogProps) {
  const [loading, setLoading] = useState(false);
  const [editedAdmin, setEditedAdmin] = useState<Level2Admin | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  // Initialize form when admin changes
  useEffect(() => {
    if (admin) {
      setEditedAdmin(admin);
      setSelectedPermissions(admin.permissions);
      setSelectedSchools(admin.assigned_schools);
      setNotes(admin.notes || '');
      setIsActive(admin.is_active);
    }
  }, [admin]);

  if (!admin || !editedAdmin) return null;

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

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update admin profile notes and status
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .update({
          notes: notes || null,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', admin.id);

      if (profileError) throw profileError;

      // Update permissions - remove old ones and add new ones
      const { error: removePermissionsError } = await supabase
        .from('admin_permissions')
        .update({ is_active: false })
        .eq('admin_user_id', admin.id);

      if (removePermissionsError) throw removePermissionsError;

      // Add new permissions
      if (selectedPermissions.length > 0) {
        const permissionInserts = selectedPermissions.map(permission => ({
          admin_user_id: admin.id,
          permission_type: permission,
          is_active: true,
          created_at: new Date().toISOString()
        }));

        const { error: addPermissionsError } = await supabase
          .from('admin_permissions')
          .insert(permissionInserts);

        if (addPermissionsError) throw addPermissionsError;
      }

      // Update school assignments - remove old ones and add new ones
      const { error: removeAssignmentsError } = await supabase
        .from('admin_assignments')
        .update({ is_active: false })
        .eq('admin_user_id', admin.id);

      if (removeAssignmentsError) throw removeAssignmentsError;

      // Add new assignments
      if (selectedSchools.length > 0) {
        const assignmentInserts = selectedSchools.map(schoolId => ({
          admin_user_id: admin.id,
          school_id: schoolId,
          is_active: true,
          created_at: new Date().toISOString()
        }));

        const { error: addAssignmentsError } = await supabase
          .from('admin_assignments')
          .insert(assignmentInserts);

        if (addAssignmentsError) throw addAssignmentsError;
      }

      toast({
        title: "Success",
        description: `${admin.name}'s settings have been updated successfully.`,
      });

      onSave();
      onOpenChange(false);

    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: "Failed to update admin settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(admin.permissions.sort()) ||
      JSON.stringify(selectedSchools.sort()) !== JSON.stringify(admin.assigned_schools.sort()) ||
      notes !== (admin.notes || '') ||
      isActive !== admin.is_active
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Edit Level 2 Admin
          </DialogTitle>
          <DialogDescription>
            Modify permissions and school assignments for {admin.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin Basic Info (Read-only) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-lg font-semibold">{admin.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-lg">{admin.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{new Date(admin.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <label
                      htmlFor="is-active"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this admin..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Permissions</h3>
              <Badge variant="outline">
                {selectedPermissions.length} selected
              </Badge>
            </div>
            
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
                          className="text-sm font-medium leading-none cursor-pointer"
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">School Assignments</h3>
              <Badge variant="outline">
                {selectedSchools.length} selected
              </Badge>
            </div>
            
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

          {/* Changes Warning */}
          {hasChanges() && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You have unsaved changes
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !hasChanges()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
