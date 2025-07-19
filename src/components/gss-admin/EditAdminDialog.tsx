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

// Updated interface for consolidated admin table
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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  // Initialize form when admin changes
  useEffect(() => {
    if (admin) {
      setSelectedPermissions(admin.permissions || []);
      setSelectedSchools(admin.school_ids || []);
      setNotes(admin.notes || '');
      setIsActive(admin.is_active);
    }
  }, [admin]);

  if (!admin) return null;

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
      
      console.log('🔄 Updating admin using new consolidated table...');
      console.log('Admin ID:', admin.user_id);
      console.log('New permissions:', selectedPermissions);
      console.log('New schools:', selectedSchools);
      console.log('New notes:', notes);
      console.log('New status:', isActive);

      // Use the new update function for the consolidated table
      const { data: updateResult, error: updateError } = await supabase.rpc('update_admin', {
        p_user_id: admin.user_id,
        p_permissions: selectedPermissions,
        p_school_ids: selectedSchools,
        p_notes: notes || null,
        p_is_active: isActive
      });

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Update result:', updateResult);

      if (!updateResult?.success) {
        throw new Error(updateResult?.message || 'Failed to update admin');
      }

      console.log('🎉 Admin updated successfully');

      toast({
        title: "Success",
        description: `${admin.name}'s settings have been updated successfully.`,
      });

      onSave();
      onOpenChange(false);

    } catch (error) {
      console.error('❌ Error updating admin:', error);
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
      JSON.stringify(selectedPermissions.sort()) !== JSON.stringify((admin.permissions || []).sort()) ||
      JSON.stringify(selectedSchools.sort()) !== JSON.stringify((admin.school_ids || []).sort()) ||
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
