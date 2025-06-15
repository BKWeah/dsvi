import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    admin_email: '',
    package_type: 'standard' as 'standard' | 'advanced',
    subscription_start: new Date().toISOString().split('T')[0], // Today's date
    subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // One year from now
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
        contact_info: null,
        package_type: formData.package_type,
        subscription_start: formData.subscription_start,
        subscription_end: formData.subscription_end,
        subscription_status: 'active'
      }, formData.admin_email);

      toast({
        title: "Success",
        description: formData.admin_email 
          ? `School "${school.name}" created successfully! An invitation email has been sent to ${formData.admin_email}.`
          : `School "${school.name}" created successfully! Admin users can be assigned separately.`,
      });

      // Reset form
      setFormData({
        name: '',
        logo_url: '',
        admin_email: '',
        package_type: 'standard',
        subscription_start: new Date().toISOString().split('T')[0],
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
            <Label htmlFor="admin_email">Admin Email (optional)</Label>
            <Input
              id="admin_email"
              type="email"
              value={formData.admin_email}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
              placeholder="admin@school.com"
            />
            <p className="text-xs text-muted-foreground">
              If provided, an invitation email will be sent to this address with signup instructions.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="package_type">Package Type</Label>
            <Select 
              value={formData.package_type} 
              onValueChange={(value: 'standard' | 'advanced') => 
                setFormData(prev => ({ ...prev, package_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Package</SelectItem>
                <SelectItem value="advanced">Advanced Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscription_start">Subscription Start</Label>
              <Input
                id="subscription_start"
                type="date"
                value={formData.subscription_start}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_start: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription_end">Subscription End</Label>
              <Input
                id="subscription_end"
                type="date"
                value={formData.subscription_end}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_end: e.target.value }))}
                required
              />
            </div>
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
