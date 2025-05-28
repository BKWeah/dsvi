import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2, Upload, Link as LinkIcon } from 'lucide-react';

interface School {
  id: string;
  name: string;
  logo_url?: string;
  contact_info?: any;
  theme_settings?: any;
}

export default function MobileSchoolSettingsPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (schoolId) {
      fetchSchool();
    }
  }, [schoolId]);

  const fetchSchool = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (error) throw error;
      
      setSchool(data);
      setSchoolName(data.name || '');
      setLogoUrl(data.logo_url || '');
    } catch (error) {
      console.error('Error fetching school:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schoolId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: schoolName,
          logo_url: logoUrl || null,
        })
        .eq('id', schoolId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "School settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "Error",
        description: "Failed to save school settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar title="School Settings" showBackButton />
        <div className="flex items-center justify-center h-64 p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileTopBar 
        title="School Settings"
        subtitle={school?.name}
        showBackButton
        onBack={() => navigate('/dsvi-admin/schools')}
        actionButton={{
          label: "Save",
          onClick: handleSave
        }}
      />
      
      <div className="p-4 pb-24">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs">Brand</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoUrl && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img 
                        src={logoUrl} 
                        alt="School logo" 
                        className="w-20 h-20 object-contain border rounded-lg"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLogoUrl('')}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="logoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to your school logo image
                  </p>
                </div>

                <Button variant="outline" className="w-full h-12">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Logo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme & Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced branding options coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contact settings coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomAppBar userRole="DSVI_ADMIN" />
    </div>
  );
}
