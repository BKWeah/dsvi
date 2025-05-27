import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchoolAdded: () => void;
}

export function AddSchoolDialog({ open, onOpenChange, onSchoolAdded }: AddSchoolDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    admin_email: '',
    admin_password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the school admin user without logging them in
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.admin_email,
        password: formData.admin_password,
        user_metadata: {
          role: 'SCHOOL_ADMIN'
        },
        email_confirm: true
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create the school with the admin user ID
      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url || null,
          admin_user_id: authData.user.id
        });

      if (schoolError) throw schoolError;

      toast({
        title: "Success",
        description: "School and admin user created successfully",
      });

      setFormData({
        name: '',
        slug: '',
        logo_url: '',
        admin_email: '',
        admin_password: ''
      });

      onSchoolAdded();
    } catch (error: any) {
      console.error('Error creating school:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to create school";
      if (error.message?.includes('admin.createUser')) {
        errorMessage = "Failed to create admin user. You may need admin privileges.";
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "A school with this slug already exists";
      } else if (error.message) {
        errorMessage = error.message;
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New School</DialogTitle>
          <DialogDescription>
            Create a new school and assign a school administrator.
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
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="school-name"
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
            <Label htmlFor="admin_email">School Admin Email</Label>
            <Input
              id="admin_email"
              type="email"
              value={formData.admin_email}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
              placeholder="admin@school.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin_password">School Admin Password</Label>
            <Input
              id="admin_password"
              type="password"
              value={formData.admin_password}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
              placeholder="Enter password"
              required
              minLength={6}
            />
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
