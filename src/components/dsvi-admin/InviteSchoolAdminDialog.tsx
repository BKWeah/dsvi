import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Copy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: { id: string; name: string; } | null;
}

export function InviteSchoolAdminDialog({ open, onOpenChange, school }: Props) {
  const { toast } = useToast();

  const generateLink = () => {
    if (!school) return '';
    const params = new URLSearchParams({
      school_id: school.id,
      school_name: school.name,
      role: 'SCHOOL_ADMIN'
    });
    return `${window.location.origin}/signup?${params.toString()}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateLink());
      toast({ title: "Link Copied!", description: "Signup link copied" });
    } catch {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            School Admin Signup Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Generate signup link for <strong>{school.name}</strong>:</p>
          <div className="flex gap-2">
            <Input value={generateLink()} readOnly className="text-xs" />
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Admins using this link will be assigned to {school.name}.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
