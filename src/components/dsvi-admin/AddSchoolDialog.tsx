import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { createSchool } from '@/lib/database';

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchoolAdded: () => void;
}

export function AddSchoolDialog({ open, onOpenChange, onSchoolAdded }: AddSchoolDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    admin_email: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the school using our database utility function
      const school = await createSchool({
        name: formData.name,
        logo_url: formData.logo_url || null,
        admin_user_id: null, // Will be assigned later
        theme_settings: null,
        contact_info: null
      }, formData.admin_email);

      toast({
        title: "Success",
        description: `School "${school.name}" created successfully! Admin users can be assigned separately.`,
      });

      // Reset form
      setFormData({
        name: '',
        logo_url: '',
        admin_email: ''
      });

      onSchoolAdded();
    } catch (error: any) {
      console.error('Error creating school:', error);
      
      let errorMessage = "Failed to create school";
      if (error?.message) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorMessage = "A school with this name or URL already exists";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New School</DialogTitle>
          <DialogDescription>
            Create a new school. Admin users can be assigned after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">School Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter school name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL (optional)</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin_email">Admin Email (for reference)</Label>
            <Input
              id="admin_email"
              type="email"
              value={formData.admin_email}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
              placeholder="admin@school.com (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Note: Admin users should sign up separately and can be linked to the school later.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create School'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
