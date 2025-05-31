import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { CreateTemplateRequest, TemplateType, TEMPLATE_TYPE_LABELS } from '@/lib/messaging-types';
import { Plus } from 'lucide-react';

interface TemplateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated: () => void;
}

export function TemplateManagerDialog({ 
  open, 
  onOpenChange, 
  onTemplateCreated 
}: TemplateManagerDialogProps) {
  // No-op change to trigger recompile
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('custom');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Template suggestions based on type
  const templateSuggestions = {
    welcome: {
      subject: 'Welcome to DSVI - Your School Website is Ready!',
      body: `Hello {{school_name}},

Welcome to the Digital School Visibility Initiative! We're excited to have you on board.

Your school website has been created and is ready for customization.

Best regards,
The DSVI Team`
    },
    expiry_warning: {
      subject: 'Your DSVI Subscription Expires in {{days_until_expiry}} Days',
      body: `Hello {{school_name}},

This is a reminder that your DSVI subscription will expire on {{expiry_date}}.

Please renew your subscription to continue enjoying our services.

Best regards,
The DSVI Team`
    },
    custom: {
      subject: '',
      body: ''
    }
  };
  const handleTemplateTypeChange = (type: TemplateType) => {
    setTemplateType(type);
    
    // Auto-fill with suggestions
    const suggestion = templateSuggestions[type];
    if (suggestion && (suggestion.subject || suggestion.body)) {
      setSubject(suggestion.subject);
      setBody(suggestion.body);
    }
  };

  const resetForm = () => {
    setName('');
    setSubject('');
    setBody('');
    setTemplateType('custom');
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Template subject is required",
        variant: "destructive",
      });
      return false;
    }

    if (!body.trim()) {
      toast({
        title: "Validation Error",
        description: "Template body is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);

      // Extract variables from template
      const variables = [...new Set([
        ...subject.match(/\{\{(\w+)\}\}/g)?.map(match => match.slice(2, -2)) || [],
        ...body.match(/\{\{(\w+)\}\}/g)?.map(match => match.slice(2, -2)) || []
      ])];

      const request: CreateTemplateRequest = {
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        template_type: templateType,
        variables,
        is_active: true
      };

      await messagingService.createTemplate(request);
      onTemplateCreated();
      resetForm();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };
  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Message Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable email template for common communications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>

          {/* Template Type */}
          <div className="space-y-2">
            <Label>Template Type</Label>
            <Select value={templateType} onValueChange={handleTemplateTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message Body *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter message content..."
              rows={10}
            />
            <p className="text-xs text-muted-foreground">
              Use {`{{variable_name}}`} for dynamic content (e.g., {`{{school_name}}`} for school name)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
