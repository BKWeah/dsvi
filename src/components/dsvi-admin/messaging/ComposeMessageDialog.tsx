import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { MessageTemplate, CreateMessageRequest } from '@/lib/messaging-types';
import { Send, Users, Mail } from 'lucide-react';

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent: () => void;
  templates: MessageTemplate[];
  preSelectedSchools?: string[];
}

interface School {
  id: string;
  name: string;
  contact_info: any;
}

export function ComposeMessageDialog({ 
  open, 
  onOpenChange, 
  onMessageSent, 
  templates,
  preSelectedSchools = []
}: ComposeMessageDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>(preSelectedSchools);
  const [selectAllSchools, setSelectAllSchools] = useState(false);
  const [externalEmails, setExternalEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Load schools when dialog opens
  useEffect(() => {
    let mounted = true;
    let loadAttempted = false;

    const loadSchools = async () => {
      if (!open || loading || loadAttempted) {
        console.log('Skipping load - open:', open, 'loading:', loading, 'loadAttempted:', loadAttempted);
        return;
      }
      
      loadAttempted = true;
      
      try {
        setLoading(true);
        console.log('Starting to load schools...');
        
        // Add a small delay to prevent rapid calls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const schoolsData = await messagingService.getAccessibleSchools();
        
        if (mounted && open) {
          console.log('Schools loaded successfully:', schoolsData.length);
          setSchools(schoolsData);
          
          if (schoolsData.length === 0) {
            toast({
              title: "No Schools Found",
              description: "No schools are available for messaging",
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        console.error('Failed to load schools:', error);
        
        if (mounted && open) {
          setSchools([]);
          toast({
            title: "Error Loading Schools",
            description: `Failed to load schools: ${error.message}. You can still send to external email addresses.`,
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (open) {
      console.log('Dialog opened at', new Date().toISOString());
      
      // Reset form state when dialog opens (if no pre-selected schools)
      if (!preSelectedSchools.length) {
        setSubject('');
        setBody('');
        setSelectedTemplate('');
        setSelectedSchools([]);
        setSelectAllSchools(false);
        setExternalEmails('');
      } else {
        setSelectedSchools(preSelectedSchools);
      }
      
      // Reset schools when dialog opens
      setSchools([]);
      
      // Load schools with a small delay
      setTimeout(() => {
        if (mounted && open) {
          loadSchools();
        }
      }, 200);
    }

    return () => {
      mounted = false;
      console.log('Dialog cleanup at', new Date().toISOString());
    };
  }, [open]); // Only depend on 'open' to avoid loops

  const handleTemplateSelect = (templateId: string) => {
    console.log('Template selection triggered with ID:', templateId);
    
    if (!templateId || templateId === 'none') {
      // Clear template selection
      setSelectedTemplate('');
      console.log('Template selection cleared');
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    console.log('Found template:', template);
    
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);
      
      console.log('Template applied successfully');
      toast({
        title: "Template Applied",
        description: `Template "${template.name}" has been applied`,
      });
    } else {
      console.error('Template not found for ID:', templateId);
      console.error('Available template IDs:', templates.map(t => t.id));
      toast({
        title: "Error",
        description: "Template not found",
        variant: "destructive",
      });
    }
  };
  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectAllSchools) {
      setSelectedSchools([]);
      setSelectAllSchools(false);
    } else {
      setSelectedSchools(schools.map(s => s.id));
      setSelectAllSchools(true);
    }
  };

  const validateForm = (): boolean => {
    if (!subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return false;
    }

    if (!body.trim()) {
      toast({
        title: "Validation Error",
        description: "Message body is required",
        variant: "destructive",
      });
      return false;
    }

    const hasSchoolRecipients = selectedSchools.length > 0 || selectAllSchools;
    const hasExternalRecipients = externalEmails.trim().length > 0;

    if (!hasSchoolRecipients && !hasExternalRecipients) {
      toast({
        title: "Validation Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };
  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      setSending(true);

      // Parse external emails
      const externalEmailList = externalEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email, name: null }));

      const request: CreateMessageRequest = {
        subject: subject.trim(),
        body: body.trim(),
        template_id: selectedTemplate || undefined,
        recipients: {
          school_ids: selectAllSchools ? undefined : selectedSchools,
          all_schools: selectAllSchools,
          external_emails: externalEmailList.length > 0 ? externalEmailList : undefined
        }
      };

      console.log('Sending message with request:', request);
      await messagingService.sendMessage(request);
      
      console.log('Message sent successfully');
      onMessageSent();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getTotalRecipients = () => {
    let count = 0;
    
    if (selectAllSchools) {
      count += schools.length;
    } else {
      count += selectedSchools.length;
    }

    const externalEmailList = externalEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    count += externalEmailList.length;
    
    return count;
  };
  const clearTemplate = () => {
    setSelectedTemplate('');
    setSubject('');
    setBody('');
    toast({
      title: "Template Cleared",
      description: "Template selection has been cleared",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Message
          </DialogTitle>
          <DialogDescription>
            Send an email to schools or external recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Use Template (Optional)</Label>
              {templates.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await messagingService.createDefaultTemplates();
                      toast({
                        title: "Templates Created",
                        description: "Default templates have been created. Please refresh the page.",
                      });
                    } catch (error: any) {
                      console.error('Failed to create templates:', error);
                      toast({
                        title: "Error",
                        description: `Failed to create templates: ${error.message}`,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Create Default Templates
                </Button>
              )}
            </div>            
            {templates.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                No templates available. Click "Create Default Templates" above or create templates in the Templates tab.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {templates.length} templates available
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={selectedTemplate} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={`Select from ${templates.length} templates...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No Template --</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearTemplate}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {selectedTemplate && (
                  <div className="text-xs text-muted-foreground">
                    Template selected: {templates.find(t => t.id === selectedTemplate)?.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>
          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message here..."
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Recipients</Label>
            
            {/* School Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Schools</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectAllSchools}
                    onCheckedChange={handleSelectAllToggle}
                    disabled={loading || schools.length === 0}
                  />
                  <Label htmlFor="selectAll" className="text-sm">Select All Schools</Label>
                </div>
              </div>
              
              {!selectAllSchools && (
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Loading schools...</p>
                    </div>
                  ) : schools.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No schools available</p>
                  ) : (
                    schools.map((school) => (
                      <div key={school.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={school.id}
                          checked={selectedSchools.includes(school.id)}
                          onCheckedChange={() => handleSchoolToggle(school.id)}
                        />
                        <Label htmlFor={school.id} className="text-sm flex-1">
                          {school.name}
                          {school.contact_info?.email && (
                            <span className="text-muted-foreground ml-2">
                              ({school.contact_info.email})
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}              
              {selectAllSchools && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <Users className="h-4 w-4 inline mr-1" />
                    All {schools.length} schools will receive this message
                  </p>
                </div>
              )}
            </div>

            {/* External Email Recipients */}
            <div className="space-y-2">
              <Label htmlFor="externalEmails" className="text-sm font-medium">
                External Email Addresses (Optional)
              </Label>
              <Textarea
                id="externalEmails"
                value={externalEmails}
                onChange={(e) => setExternalEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas or new lines&#10;example@domain.com, another@domain.com"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple emails with commas or new lines
              </p>
            </div>

            {/* Recipient Summary */}
            <div className="p-3 bg-gray-50 border rounded-md">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Total Recipients: {getTotalRecipients()}
                </span>
              </div>
              {getTotalRecipients() > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectAllSchools ? (
                    <Badge variant="secondary">All Schools ({schools.length})</Badge>
                  ) : (
                    selectedSchools.map(schoolId => {
                      const school = schools.find(s => s.id === schoolId);
                      return school ? (
                        <Badge key={schoolId} variant="outline" className="text-xs">
                          {school.name}
                        </Badge>
                      ) : null;
                    })
                  )}
                  {externalEmails.trim() && (
                    <Badge variant="secondary">
                      External ({externalEmails.split(/[,\n]/).filter(e => e.trim()).length})
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || getTotalRecipients() === 0}
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message ({getTotalRecipients()})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}