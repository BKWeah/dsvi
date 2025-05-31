import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { messagingService } from '@/lib/messaging-service';
import { RefreshCw, Plus, Eye } from 'lucide-react';

export function TemplateDebugger() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await messagingService.getTemplates();
      const activeTemplates = await messagingService.getActiveTemplates();
      
      console.log('All templates:', allTemplates);
      console.log('Active templates:', activeTemplates);
      
      setTemplates(activeTemplates);
      
      toast({
        title: "Templates Loaded",
        description: `Found ${allTemplates.length} total templates, ${activeTemplates.length} active`,
      });
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestTemplate = async () => {
    try {
      const testTemplate = {
        name: `Test Template ${Date.now()}`,
        subject: 'Test Subject',
        body: 'Hello {{school_name}}, this is a test template.',
        template_type: 'custom' as const,
        variables: ['school_name']
      };
      
      const created = await messagingService.createTemplate(testTemplate);
      console.log('Created template:', created);
      
      toast({
        title: "Template Created",
        description: `Test template "${created.name}" created successfully`,
      });
      
      // Reload templates
      await loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create template: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Template Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadTemplates} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Load Templates'}
          </Button>
          <Button onClick={createTestTemplate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Test Template
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Templates Found: {templates.length}</h4>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates found. This might indicate a database connection issue or missing data.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((template: any) => (
                <div key={template.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.subject}</div>
                  <div className="text-xs text-muted-foreground">ID: {template.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
