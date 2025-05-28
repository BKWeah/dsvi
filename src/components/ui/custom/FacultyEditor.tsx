import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from '@/components/ui/alert-dialog';
import { AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, User, MoveUp, MoveDown, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { FacultyListSectionConfig, FacultyMember } from '@/lib/types';

interface FacultyEditorProps {
  config: FacultyListSectionConfig;
  onUpdate: (config: FacultyListSectionConfig) => void;
  schoolId: string;
  sectionId: string;
}

const FACULTY_TITLES = [
  'Principal', 'Vice Principal', 'Dean', 'Head of Department', 'Professor',
  'Associate Professor', 'Assistant Professor', 'Senior Lecturer', 'Lecturer',
  'Teacher', 'Instructor', 'Counselor', 'Librarian', 'Coach', 'Administrator',
  'Staff', 'Other'
];

export function FacultyEditor({ config, onUpdate, schoolId, sectionId }: FacultyEditorProps) {
  const [editingMember, setEditingMember] = useState<{ index: number; member: FacultyMember } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const facultyMembers = config.facultyMembers || [];

  const handleAddMember = (newMember: FacultyMember) => {
    onUpdate({
      ...config,
      facultyMembers: [...facultyMembers, newMember]
    });
    
    setAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Faculty member added successfully",
    });
  };
  const handleEditMember = (index: number, updatedMember: FacultyMember) => {
    const updatedMembers = facultyMembers.map((member, i) => 
      i === index ? updatedMember : member
    );
    
    onUpdate({
      ...config,
      facultyMembers: updatedMembers
    });
    
    setEditingMember(null);
    toast({
      title: "Success",
      description: "Faculty member updated successfully",
    });
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = facultyMembers.filter((_, i) => i !== index);
    onUpdate({
      ...config,
      facultyMembers: updatedMembers
    });
    
    toast({
      title: "Success",
      description: "Faculty member removed successfully",
    });
  };

  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= facultyMembers.length) return;

    const updatedMembers = [...facultyMembers];
    [updatedMembers[index], updatedMembers[newIndex]] = [updatedMembers[newIndex], updatedMembers[index]];
    
    onUpdate({
      ...config,
      facultyMembers: updatedMembers
    });
  };

  return (
    <div className="space-y-6">
      {/* Faculty Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Faculty & Staff</h3>
          <p className="text-sm text-muted-foreground">
            Manage your school's faculty and staff members
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Faculty Member</DialogTitle>
            </DialogHeader>
            <FacultyMemberForm
              onSave={handleAddMember}
              onCancel={() => setAddDialogOpen(false)}
              schoolId={schoolId}
              sectionId={sectionId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Faculty List */}
      {facultyMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No faculty members added yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first faculty member to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {facultyMembers.map((member, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={member.imageUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <Badge variant="secondary" className="mb-2">{member.title}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveMember(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveMember(index, 'down')}
                            disabled={index === facultyMembers.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMember({ index, member })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Faculty Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name} from the faculty list?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveMember(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {member.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                    
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        Position {index + 1}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Faculty Member</DialogTitle>
            </DialogHeader>
            <FacultyMemberForm
              initialData={editingMember.member}
              onSave={(updatedMember) => handleEditMember(editingMember.index, updatedMember)}
              onCancel={() => setEditingMember(null)}
              schoolId={schoolId}
              sectionId={sectionId}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Faculty Member Form Component
interface FacultyMemberFormProps {
  initialData?: FacultyMember;
  onSave: (member: FacultyMember) => void;
  onCancel: () => void;
  schoolId: string;
  sectionId: string;
}

function FacultyMemberForm({ initialData, onSave, onCancel, schoolId, sectionId }: FacultyMemberFormProps) {
  const [formData, setFormData] = useState<FacultyMember>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    bio: initialData?.bio || '',
    imageUrl: initialData?.imageUrl || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) {
      return;
    }
    onSave(formData);
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member-name">Full Name *</Label>
        <Input
          id="member-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="member-title">Title/Position *</Label>
        <Select 
          value={formData.title} 
          onValueChange={(value) => setFormData({ ...formData, title: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select title or position" />
          </SelectTrigger>
          <SelectContent>
            {FACULTY_TITLES.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="member-bio">Biography</Label>
        <Textarea
          id="member-bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Brief biography or description (optional)"
          rows={4}
        />
      </div>

      <ImageUpload
        label="Profile Photo"
        value={formData.imageUrl || ''}
        onChange={handleImageUpload}
        schoolId={schoolId}
        sectionId={`${sectionId}-faculty-${Date.now()}`}
        placeholder="Upload profile photo (optional)"
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name.trim() || !formData.title.trim()}>
          {initialData ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}
