import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Mail,
  Calendar,
  Shield,
  School,
  CheckCircle,
  XCircle,
  StickyNote,
  Clock
} from 'lucide-react';

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

interface ViewAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Level2Admin | null;
  schools: School[];
  onEdit?: () => void;
}

export function ViewAdminDialog({ 
  open, 
  onOpenChange, 
  admin,
  schools,
  onEdit
}: ViewAdminDialogProps) {
  if (!admin) return null;

  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown School';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Level 2 Admin Details
          </DialogTitle>
          <DialogDescription>
            View detailed information for {admin.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Name</span>
                  </div>
                  <p className="text-lg font-semibold">{admin.name}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-lg">{admin.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <p>{new Date(admin.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Badge variant="secondary">Level 2</Badge>
                  </div>
                </div>
              </div>

              {admin.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{admin.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions ({admin.permissions.length})
              </CardTitle>
              <CardDescription>
                Administrative permissions granted to this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {admin.permissions.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Permissions</h3>
                  <p className="text-muted-foreground">
                    This admin has not been granted any permissions yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {admin.permissions.map((permission, index) => (
                    <div 
                      key={permission} 
                      className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {formatPermissionName(permission)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Schools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <School className="h-4 w-4" />
                Assigned Schools ({admin.assigned_schools.length})
              </CardTitle>
              <CardDescription>
                Schools this admin can manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {admin.assigned_schools.length === 0 ? (
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No School Assignments</h3>
                  <p className="text-muted-foreground">
                    This admin has not been assigned to any schools yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {admin.assigned_schools.map((schoolId, index) => (
                    <div 
                      key={schoolId} 
                      className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                    >
                      <School className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {getSchoolName(schoolId)}
                      </span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        ID: {schoolId.slice(0, 8)}...
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {admin.permissions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Permissions</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {admin.assigned_schools.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Schools</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.ceil((new Date().getTime() - new Date(admin.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                <Shield className="h-4 w-4 mr-2" />
                Edit Admin
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
