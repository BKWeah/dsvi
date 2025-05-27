import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Upload, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSchoolById, updateSchool, uploadSchoolLogo } from '@/lib/database';
import { School, ComprehensiveThemeSettings } from '@/lib/types';
import { ImageUpload } from '@/components/ui/custom/ImageUpload';
import { ComprehensiveBrandingTab } from '@/components/ui/custom/ComprehensiveBrandingTab';
import { LiveThemePreview } from '@/components/ui/custom/LiveThemePreview';

export default function SchoolSettingsPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeSettings, setThemeSettings] = useState<ComprehensiveThemeSettings>({});
  const [customCSS, setCustomCSS] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchSchool();
    }
  }, [schoolId]);

  const fetchSchool = async () => {
    try {
      setLoading(true);
      const data = await getSchoolById(schoolId!);
      
      if (data?.school) {
        const school = data.school;
        setSchool(school);
        setName(school.name);
        setLogoUrl(school.logo_url || '');
        setThemeSettings(school.theme_settings || {});
        setCustomCSS(school.custom_css || '');
        setAddress(school.contact_info?.address || '');
        setPhone(school.contact_info?.phone || '');
        setEmail(school.contact_info?.email || '');
        setMapEmbedUrl(school.contact_info?.mapEmbedUrl || '');
      }
    } catch (error) {
      console.error('Error fetching school:', error);
      toast({
        title: "Error",
        description: "Failed to load school settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (school?.slug) {
      // Open school's public page in a new tab for preview
      window.open(`/s/${school.slug}`, '_blank');
    } else {
      toast({
        title: "Error",
        description: "School slug not found for preview",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!schoolId || !school) return;
    
    try {
      setSaving(true);
      
      const updatedData = {
        name,
        logo_url: logoUrl,
        theme_settings: themeSettings,
        custom_css: customCSS,
        theme_version: (school.theme_version || 1) + 1,
        contact_info: {
          address,
          phone,
          email,
          mapEmbedUrl
        }
      };

      await updateSchool(schoolId, updatedData);
      
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
    return <div className="p-6">Loading school settings...</div>;
  }

  if (!school) {
    return <div className="p-6">School not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dsvi-admin/schools')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Button>
        <div>
          <h1 className="text-3xl font-bold">School Settings</h1>
          <p className="text-muted-foreground">Configure school information and appearance</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <ComprehensiveBrandingTab
            themeSettings={themeSettings}
            customCSS={customCSS}
            logoUrl={logoUrl}
            onThemeChange={setThemeSettings}
            onCustomCSSChange={setCustomCSS}
            onLogoChange={setLogoUrl}
            onPreview={handlePreview}
          />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="School address"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="map">Google Maps Embed URL</Label>
                <Input
                  id="map"
                  value={mapEmbedUrl}
                  onChange={(e) => setMapEmbedUrl(e.target.value)}
                  placeholder="Google Maps embed URL (optional)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <LiveThemePreview
            school={school}
            themeSettings={themeSettings}
            customCSS={customCSS}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
