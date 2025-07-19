import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, UserPlus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  createSchoolAssignment, 
  removeSchoolAssignment, 
  getSchoolAssignments,
  updateSchoolAssignmentPermissions 
} from '@/lib/database';
import { AdminSchoolAssignment } from '@/lib/types';

interface SchoolAssignmentManagerProps {
  schoolId: string;
  schoolName: string;
  onAssignmentChange?: () => void;
}

interface SchoolAdmin {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function SchoolAssignmentManager({ 
  schoolId, 
  schoolName, 
  onAssignmentChange 
}: SchoolAssignmentManagerProps) {
  const [assignments, setAssignments] = useState<AdminSchoolAssignment[]>([]);
  const [availableAdmins, setAvailableAdmins] = useState<SchoolAdmin[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [permissions, setPermissions] = useState({
    can_edit: true,
    can_approve: false,
    can_manage_content: true
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchAvailableAdmins();
  }, [schoolId]);

  const fetchAssignments = async () => {
    try {
      const data = await getSchoolAssignments(schoolId);
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load school assignments",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableAdmins = async () => {
    try {
      // Get all school admins from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, role, name')
        .eq('role', 'SCHOOL_ADMIN');
      
      if (error) throw error;

      setAvailableAdmins(data || []);
    } catch (error) {
      console.error('Error fetching school admins:', error);
      setAvailableAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedAdmin) return;

    setIsSubmitting(true);
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('Not authenticated');

      await createSchoolAssignment({
        school_admin_id: selectedAdmin,
        school_id: schoolId,
        assigned_by: currentUser.data.user.id,
        permissions
      });

      toast({
        title: "Success",
        description: "School admin assigned successfully",
      });

      await fetchAssignments();
      setShowAssignDialog(false);
      setSelectedAdmin('');
      setPermissions({
        can_edit: true,
        can_approve: false,
        can_manage_content: true
      });
      
      onAssignmentChange?.();
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign school admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('Not authenticated');

      await removeSchoolAssignment(assignmentId, currentUser.data.user.id);

      toast({
        title: "Success",
        description: "School admin assignment removed",
      });

      await fetchAssignments();
      onAssignmentChange?.();
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async (assignmentId: string, newPermissions: Record<string, any>) => {
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('Not authenticated');

      await updateSchoolAssignmentPermissions(assignmentId, newPermissions, currentUser.data.user.id);

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });

      await fetchAssignments();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  // Filter out already assigned admins
  const unassignedAdmins = availableAdmins.filter(admin => 
    !assignments.some(assignment => assignment.school_admin_id === admin.id)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>School Admin Assignments</CardTitle>
          <CardDescription>Loading assignments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>School Admin Assignments</CardTitle>
            <CardDescription>
              Manage which school admins can access {schoolName}
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowAssignDialog(true)}
            disabled={unassignedAdmins.length === 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No school admins assigned to this school</p>
            <Button 
              onClick={() => setShowAssignDialog(true)}
              className="mt-4"
              disabled={unassignedAdmins.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign First Admin
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const admin = availableAdmins.find(a => a.id === assignment.school_admin_id);
              return (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {admin?.name || admin?.email || 'Unknown Admin'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {admin?.email}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {assignment.permissions.can_edit && (
                        <Badge variant="secondary">Can Edit</Badge>
                      )}
                      {assignment.permissions.can_approve && (
                        <Badge variant="default">Can Approve</Badge>
                      )}
                      {assignment.permissions.can_manage_content && (
                        <Badge variant="outline">Manage Content</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Assigned {new Date(assignment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement permissions dialog
                        toast({
                          title: "Feature Coming Soon",
                          description: "Permission editing will be available in the next update",
                        });
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assign Admin Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign School Admin</DialogTitle>
              <DialogDescription>
                Assign a school administrator to {schoolName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-select">Select School Admin</Label>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name || admin.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {unassignedAdmins.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No available school admins to assign
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_edit"
                      checked={permissions.can_edit}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, can_edit: !!checked }))
                      }
                    />
                    <Label htmlFor="can_edit" className="text-sm">
                      Can edit content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_approve"
                      checked={permissions.can_approve}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, can_approve: !!checked }))
                      }
                    />
                    <Label htmlFor="can_approve" className="text-sm">
                      Can approve content (Level 1 permission)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_manage_content"
                      checked={permissions.can_manage_content}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, can_manage_content: !!checked }))
                      }
                    />
                    <Label htmlFor="can_manage_content" className="text-sm">
                      Can manage all content sections
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignAdmin}
                disabled={!selectedAdmin || isSubmitting}
              >
                {isSubmitting ? 'Assigning...' : 'Assign Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}