import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomActionBar } from '@/components/mobile/MobileBottomActionBar';
import { ScrollableTabs } from '@/components/mobile/ScrollableTabs';
import { BottomAppBar } from '@/components/mobile/BottomAppBar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Upload, Eye } from 'lucide-react';

// Import the missing components and functions
import { getSchoolById, updateSchool, uploadSchoolLogo } from '@/lib/database';
import { School, ComprehensiveThemeSettings } from '@/lib/types';
import { ImageUpload } from '@/components/ui/custom/ImageUpload';
import { SchoolLogoUpload } from '@/components/ui/custom/SchoolLogoUpload';
import { ComprehensiveBrandingTab } from '@/components/ui/custom/ComprehensiveBrandingTab';
import { LiveThemePreview } from '@/components/ui/custom/LiveThemePreview';

export default function ImprovedResponsiveSchoolSettingsPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Enhanced state management from original
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Comprehensive form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeSettings, setThemeSettings] = useState<ComprehensiveThemeSettings>({});
  const [customCSS, setCustomCSS] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

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
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar 
          title="School Settings" 
          subtitle="Loading..." 
          backUrl="/dsvi-admin/schools" 
        />
        
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading school settings...</p>
          </div>
        </div>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar 
          title="School Settings" 
          subtitle="Error" 
          backUrl="/dsvi-admin/schools" 
        />
        
        <div className="p-4">
          <p className="text-muted-foreground">School not found</p>
        </div>
        <BottomAppBar userRole="DSVI_ADMIN" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Native-like Mobile Top Bar */}
      <MobileTopBar 
        title="School Settings" 
        subtitle={school?.name || "Configure school information"}
        backUrl="/dsvi-admin/schools" 
      />

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
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
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      
      {/* Main Content with improved mobile spacing */}
      <div className="p-4 pb-32 md:pb-4 space-y-6">
        <Tabs defaultValue="general" className="space-y-6">
          {/* Main Tabs - Mobile Optimized with better spacing */}
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 rounded-lg p-1">
            <TabsTrigger value="general" className="text-sm font-medium h-10 rounded-md">
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-sm font-medium h-10 rounded-md">
              Branding
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-sm font-medium h-10 rounded-md">
              Contact
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-sm font-medium h-10 rounded-md">
              Preview
            </TabsTrigger>
          </TabsList>
          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="schoolName" className="text-sm font-medium">School Name</Label>
                  <Input
                    id="schoolName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base"
                    placeholder="Enter school name"
                  />
                </div>
                
                <div className="space-y-3">
                  <SchoolLogoUpload
                    value={logoUrl}
                    onChange={setLogoUrl}
                    schoolId={schoolId!}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comprehensive Branding Tab with Scrollable Sub-tabs */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Advanced Branding & Theme Customization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize every aspect of your school's public website appearance
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Changes Button - Properly positioned */}
                <Button onClick={handlePreview} variant="outline" className="w-full h-12 mb-6">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Changes
                </Button>

                {/* Improved Scrollable Secondary Tabs */}
                <ScrollableTabs
                  defaultValue="colors"
                  tabs={[
                    {
                      value: "colors",
                      label: "Colors",
                      content: (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-4 p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg shadow-sm"></div>
                                <div className="w-12 h-12 bg-gray-500 rounded-lg shadow-sm"></div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Classic Blue</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Professional and clean design with blue accents
                                </p>
                                <Button size="sm" className="w-full">Apply Theme</Button>
                              </div>
                            </div>
                            
                            <div className="space-y-4 p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-500 rounded-lg shadow-sm"></div>
                                <div className="w-12 h-12 bg-gray-600 rounded-lg shadow-sm"></div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Nature Green</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Fresh and natural design with green tones
                                </p>
                                <Button size="sm" variant="outline" className="w-full">Apply Theme</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      value: "typography",
                      label: "Typography",
                      content: (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Typography settings coming soon...</p>
                        </div>
                      )
                    },
                    {
                      value: "layout",
                      label: "Layout",
                      content: (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Layout settings coming soon...</p>
                        </div>
                      )
                    },
                    {
                      value: "navigation",
                      label: "Navigation",
                      content: (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Navigation settings coming soon...</p>
                        </div>
                      )
                    },
                    {
                      value: "components",
                      label: "Components",
                      content: (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Component settings coming soon...</p>
                        </div>
                      )
                    },
                    {
                      value: "advanced",
                      label: "Advanced",
                      content: (
                        <div className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Custom CSS</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Add custom CSS to override styles and create unique designs
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <Label htmlFor="custom-css" className="text-sm font-medium">Custom CSS Code</Label>
                                <Textarea
                                  id="custom-css"
                                  value={customCSS}
                                  onChange={(e) => setCustomCSS(e.target.value)}
                                  placeholder="/* Enter your custom CSS here */
.school-header { 
  background: linear-gradient(45deg, #your-color1, #your-color2);
}

.custom-button {
  border-radius: 25px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}"
                                  className="min-h-[200px] font-mono text-sm"
                                />
                              </div>
                              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <strong>Tip:</strong> Use CSS variables like <code>var(--theme-primary)</code> to reference your theme colors.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="School address"
                    rows={3}
                    className="text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contact email"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="map" className="text-sm font-medium">Google Maps Embed URL</Label>
                  <Input
                    id="map"
                    value={mapEmbedUrl}
                    onChange={(e) => setMapEmbedUrl(e.target.value)}
                    placeholder="Google Maps embed URL (optional)"
                    className="h-12 text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Live Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Live Theme Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See how your school website will look with current settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button 
                    onClick={handlePreview} 
                    className="w-full md:w-auto h-12"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Open Preview in New Tab
                  </Button>
                </div>
                
                <LiveThemePreview
                  school={school}
                  themeSettings={themeSettings}
                  customCSS={customCSS}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Save Button at Bottom for Mobile - Native style */}
      <MobileBottomActionBar
        primaryAction={{
          label: "Save Settings",
          onClick: handleSave,
          loading: saving,
          disabled: saving
        }}
      />

      {/* Bottom Navigation */}
      <BottomAppBar userRole="DSVI_ADMIN" />
    </div>
  );
}