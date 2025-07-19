import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFeature } from '@/contexts/FeatureFlagContext';
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
import { ArrowLeft, Save, Upload, Eye, CreditCard } from 'lucide-react';

// Import the missing components and functions
import { getSchoolById, updateSchool, uploadSchoolLogo } from '@/lib/database';
import { School, ComprehensiveThemeSettings } from '@/lib/types';
import { ImageUpload } from '@/components/ui/custom/ImageUpload';
import { SchoolLogoUpload } from '@/components/ui/custom/SchoolLogoUpload';
import { ComprehensiveBrandingTab } from '@/components/ui/custom/ComprehensiveBrandingTab';
import { LiveThemePreview } from '@/components/ui/custom/LiveThemePreview';
import { SchoolAssignmentManager } from '@/components/dsvi-admin/SchoolAssignmentManager';
import { generateSchoolHomepageUrl } from '@/lib/subdomain-utils';

export default function ImprovedResponsiveSchoolSettingsPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Enhanced state management from original
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Comprehensive form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeSettings, setThemeSettings] = useState<ComprehensiveThemeSettings>({});
  const [customCSS, setCustomCSS] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  
  // Subscription state
  const [packageType, setPackageType] = useState<'standard' | 'advanced'>('standard');
  const [subscriptionStart, setSubscriptionStart] = useState('');
  const [subscriptionEnd, setSubscriptionEnd] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expiring' | 'inactive' | 'trial'>('active');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [subscriptionNotes, setSubscriptionNotes] = useState('');

  // Feature flag checks with fallback to true (non-destructive)
  let isSubscriptionEnabled = true;
  let isAdminAssignmentsEnabled = true;
  let isContentManagementEnabled = true;

  try {
    isSubscriptionEnabled = useFeature('schools.schoolSettings.subscription');
    isAdminAssignmentsEnabled = useFeature('schools.schoolSettings.adminAssignments');
    isContentManagementEnabled = useFeature('schools.schoolSettings.contentManagement');
  } catch (error) {
    // If feature flag system is not available, show all tabs (non-destructive)
    console.warn('Feature flag system not available, showing all tabs');
  }

  useEffect(() => {
    if (schoolId) {
      fetchSchool();
    }
  }, [schoolId]);

  // Monitor toast notifications to adjust save button position
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const toastElements = document.querySelectorAll('[data-sonner-toaster] [data-sonner-toast]');
      if (toastElements.length > 0) {
        document.body.classList.add('toast-present');
      } else {
        document.body.classList.remove('toast-present');
      }
    });

    // Start observing
    const toastContainer = document.querySelector('[data-sonner-toaster]');
    if (toastContainer) {
      observer.observe(toastContainer, { childList: true, subtree: true });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      document.body.classList.remove('toast-present');
    };
  }, []);

  // Helper function to mark changes
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Enhanced change handlers that track modifications
  const handleNameChange = (value: string) => {
    setName(value);
    markAsChanged();
  };

  const handleLogoChange = (url: string) => {
    setLogoUrl(url);
    markAsChanged();
  };

  const handleThemeChange = (theme: ComprehensiveThemeSettings) => {
    setThemeSettings(theme);
    markAsChanged();
  };

  const handleCustomCSSChange = (css: string) => {
    setCustomCSS(css);
    markAsChanged();
  };

  const handleContactChange = (field: string, value: string) => {
    markAsChanged();
    switch (field) {
      case 'address':
        setAddress(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'mapEmbedUrl':
        setMapEmbedUrl(value);
        break;
    }
  };
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
        
        // Set subscription fields
        setPackageType(school.package_type || 'standard');
        setSubscriptionStart(school.subscription_start || '');
        setSubscriptionEnd(school.subscription_end || '');
        setSubscriptionStatus(school.subscription_status || 'active');
        setAutoRenewal(school.auto_renewal !== false);
        setSubscriptionNotes(school.subscription_notes || '');
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
      window.open(generateSchoolHomepageUrl(school.slug), '_blank');
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
        },
        package_type: packageType,
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
        subscription_status: subscriptionStatus,
        auto_renewal: autoRenewal,
        subscription_notes: subscriptionNotes
      };

      await updateSchool(schoolId, updatedData);
      
      toast({
        title: "Success",
        description: "School settings saved successfully",
      });
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      
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
      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 md:bottom-6 md:right-6 left-4 md:left-auto z-50">
          <div className="relative p-0.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-pulse">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-white text-gray-900 hover:bg-gray-50 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: 'white', color: '#1f2937' }}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

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
      </div>
      
      {/* Main Content with improved mobile spacing */}
      <div className="p-4 pb-32 md:pb-4 space-y-6">
        <Tabs defaultValue="general" className="space-y-6">
          {/* Main Tabs - Mobile Optimized with better spacing */}
          <TabsList className={`grid w-full h-12 bg-muted/50 rounded-lg p-1 ${
            // Dynamic grid based on available tabs
            [
              true, // general (always shown)
              true, // branding (always shown)
              isSubscriptionEnabled,
              true, // contact (always shown)
              isAdminAssignmentsEnabled,
              true  // preview (always shown)
            ].filter(Boolean).length === 6 ? 'grid-cols-6' :
            [
              true, // general
              true, // branding
              isSubscriptionEnabled,
              true, // contact
              isAdminAssignmentsEnabled,
              true  // preview
            ].filter(Boolean).length === 5 ? 'grid-cols-5' : 'grid-cols-4'
          }`}>
            <TabsTrigger value="general" className="text-sm font-medium h-10 rounded-md">
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-sm font-medium h-10 rounded-md">
              Branding
            </TabsTrigger>
            {isSubscriptionEnabled && (
              <TabsTrigger value="subscription" className="text-sm font-medium h-10 rounded-md">
                Subscription
              </TabsTrigger>
            )}
            <TabsTrigger value="contact" className="text-sm font-medium h-10 rounded-md">
              Contact
            </TabsTrigger>
            {isAdminAssignmentsEnabled && (
              <TabsTrigger value="assignments" className="text-sm font-medium h-10 rounded-md">
                Assignments
              </TabsTrigger>
            )}
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
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-12 text-base"
                    placeholder="Enter school name"
                  />
                </div>
                
                <div className="space-y-3">
                  <SchoolLogoUpload
                    value={logoUrl}
                    onChange={handleLogoChange}
                    schoolId={schoolId!}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comprehensive Branding Tab with Mobile-Friendly ScrollableTabs */}
          <TabsContent value="branding" className="space-y-6">
            {/* Desktop: Use full ComprehensiveBrandingTab */}
            <div className="hidden md:block">
              <ComprehensiveBrandingTab
                themeSettings={themeSettings}
                customCSS={customCSS}
                logoUrl={logoUrl}
                onThemeChange={handleThemeChange}
                onCustomCSSChange={handleCustomCSSChange}
                onLogoChange={handleLogoChange}
                onPreview={handlePreview}
              />
            </div>

            {/* Mobile: Use ScrollableTabs for better UX */}
            <div className="block md:hidden">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Advanced Branding & Theme Customization</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize every aspect of your school's public website appearance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preview Changes Button */}
                  <Button onClick={handlePreview} variant="outline" className="w-full h-12 mb-6">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Changes
                  </Button>

                  {/* Mobile-Friendly ScrollableTabs */}
                  <ScrollableTabs
                    defaultValue="colors"
                    tabs={[
                      {
                        value: "colors",
                        label: "Colors",
                        content: (
                          <div className="space-y-6">
                            {/* Theme Presets */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Theme Presets</h3>
                              <p className="text-xs text-muted-foreground">Choose from pre-designed themes or customize your own</p>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-4 p-4 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Classic Blue</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Professional and clean design with blue accents  
                                    </p>
                                    <Button size="sm" className="w-full">Apply Theme</Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-4 p-4 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-emerald-600 rounded-full"></div>
                                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Modern Green</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Fresh and vibrant with green nature tones
                                    </p>
                                    <Button size="sm" variant="outline" className="w-full">Apply Theme</Button>
                                  </div>
                                </div>

                                <div className="space-y-4 p-4 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
                                    <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Academic Purple</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Scholarly and elegant with purple accents
                                    </p>
                                    <Button size="sm" variant="outline" className="w-full">Apply Theme</Button>
                                  </div>
                                </div>

                                <div className="space-y-4 p-4 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Warm Orange</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Energetic and friendly with warm orange tones
                                    </p>
                                    <Button size="sm" variant="outline" className="w-full">Apply Theme</Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Color Palette Generator */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Color Palette Generator</h3>
                              <p className="text-xs text-muted-foreground">Generate coordinated colors from your primary color</p>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Primary Color</Label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="color" 
                                    className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                    defaultValue="#3b82f6"
                                  />
                                  <Input 
                                    placeholder="#3b82f6" 
                                    className="flex-1 h-12" 
                                    defaultValue="#3b82f6"
                                  />
                                  <Button size="sm" className="px-4">
                                    Generate
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Brand Colors</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Primary Color</Label>
                                  <p className="text-xs text-muted-foreground">Main brand color for buttons, links, and highlights</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#3b82f6"
                                    />
                                    <Input 
                                      placeholder="#3b82f6" 
                                      className="flex-1 h-12" 
                                      defaultValue="#3b82f6"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Secondary Color</Label>
                                  <p className="text-xs text-muted-foreground">Supporting brand color for accents</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#64748b"
                                    />
                                    <Input 
                                      placeholder="#64748b" 
                                      className="flex-1 h-12" 
                                      defaultValue="#64748b"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Accent Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for call-to-action elements</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#10b981"
                                    />
                                    <Input 
                                      placeholder="#10b981" 
                                      className="flex-1 h-12" 
                                      defaultValue="#10b981"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Background Color</Label>
                                  <p className="text-xs text-muted-foreground">Main background color of the website</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#ffffff"
                                    />
                                    <Input 
                                      placeholder="#ffffff" 
                                      className="flex-1 h-12" 
                                      defaultValue="#ffffff"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Surface Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for cards and elevated surfaces</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#f8fafc"
                                    />
                                    <Input 
                                      placeholder="#f8fafc" 
                                      className="flex-1 h-12" 
                                      defaultValue="#f8fafc"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Border Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for borders and dividers</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#e2e8f0"
                                    />
                                    <Input 
                                      placeholder="#e2e8f0" 
                                      className="flex-1 h-12" 
                                      defaultValue="#e2e8f0"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Text Colors */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Text Colors</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Primary Text</Label>
                                  <p className="text-xs text-muted-foreground">Main text color for headings and important content</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#0f172a"
                                    />
                                    <Input 
                                      placeholder="#0f172a" 
                                      className="flex-1 h-12" 
                                      defaultValue="#0f172a"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Secondary Text</Label>
                                  <p className="text-xs text-muted-foreground">Secondary text color for body content</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#475569"
                                    />
                                    <Input 
                                      placeholder="#475569" 
                                      className="flex-1 h-12" 
                                      defaultValue="#475569"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Muted Text</Label>
                                  <p className="text-xs text-muted-foreground">Muted text color for captions and less important text</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#94a3b8"
                                    />
                                    <Input 
                                      placeholder="#94a3b8" 
                                      className="flex-1 h-12" 
                                      defaultValue="#94a3b8"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status Colors */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Status Colors</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Success Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for success messages and confirmations</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#10b981"
                                    />
                                    <Input 
                                      placeholder="#10b981" 
                                      className="flex-1 h-12" 
                                      defaultValue="#10b981"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Warning Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for warnings and caution messages</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#f59e0b"
                                    />
                                    <Input 
                                      placeholder="#f59e0b" 
                                      className="flex-1 h-12" 
                                      defaultValue="#f59e0b"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Error Color</Label>
                                  <p className="text-xs text-muted-foreground">Color for error messages and alerts</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#ef4444"
                                    />
                                    <Input 
                                      placeholder="#ef4444" 
                                      className="flex-1 h-12" 
                                      defaultValue="#ef4444"
                                    />
                                  </div>
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
                          <div className="space-y-6">
                            {/* Font Families */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Font Families</h4>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Primary Font</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="Inter, system-ui, sans-serif">Inter</option>
                                  <option value="'Roboto', sans-serif">Roboto</option>
                                  <option value="'Open Sans', sans-serif">Open Sans</option>
                                  <option value="'Poppins', sans-serif">Poppins</option>
                                  <option value="'Montserrat', sans-serif">Montserrat</option>
                                  <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                                  <option value="'Lato', sans-serif">Lato</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Display Font (Headers)</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="Inter, system-ui, sans-serif">Inter</option>
                                  <option value="'Roboto', sans-serif">Roboto</option>
                                  <option value="'Poppins', sans-serif">Poppins</option>
                                  <option value="'Montserrat', sans-serif">Montserrat</option>
                                  <option value="'Playfair Display', serif">Playfair Display</option>
                                  <option value="'Merriweather', serif">Merriweather</option>
                                  <option value="Georgia, serif">Georgia</option>
                                  <option value="'Times New Roman', serif">Times New Roman</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Secondary Font (Optional)</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="Inter, system-ui, sans-serif">Inter</option>
                                  <option value="'Roboto', sans-serif">Roboto</option>
                                  <option value="'Open Sans', sans-serif">Open Sans</option>
                                  <option value="'Poppins', sans-serif">Poppins</option>
                                  <option value="'Montserrat', sans-serif">Montserrat</option>
                                </select>
                              </div>
                            </div>

                            {/* Font Sizes */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Font Sizes</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Base Font Size</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="0.875rem">14px (Small)</option>
                                    <option value="1rem">16px (Default)</option>
                                    <option value="1.125rem">18px (Large)</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Large Text</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1rem">16px</option>
                                    <option value="1.125rem">18px</option>
                                    <option value="1.25rem">20px</option>
                                    <option value="1.375rem">22px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Extra Large</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1.125rem">18px</option>
                                    <option value="1.25rem">20px</option>
                                    <option value="1.5rem">24px</option>
                                    <option value="1.75rem">28px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Heading (2XL)</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1.25rem">20px</option>
                                    <option value="1.5rem">24px</option>
                                    <option value="1.875rem">30px</option>
                                    <option value="2.25rem">36px</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Font Weights & Line Heights */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Font Weights & Line Heights</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Normal Weight</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="300">Light (300)</option>
                                    <option value="400">Normal (400)</option>
                                    <option value="500">Medium (500)</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Bold Weight</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="600">Semi-bold (600)</option>
                                    <option value="700">Bold (700)</option>
                                    <option value="800">Extra Bold (800)</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Normal Line Height</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1.25">Tight (1.25)</option>
                                    <option value="1.5">Normal (1.5)</option>
                                    <option value="1.75">Relaxed (1.75)</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Heading Line Height</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1">Very Tight (1.0)</option>
                                    <option value="1.1">Tight (1.1)</option>
                                    <option value="1.25">Normal (1.25)</option>
                                    <option value="1.375">Relaxed (1.375)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "layout",
                        label: "Layout",
                        content: (
                          <div className="space-y-6">
                            {/* Layout Settings */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Layout Settings</h4>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Container Max Width</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="1024px">1024px (Small)</option>
                                  <option value="1200px">1200px (Medium)</option>
                                  <option value="1400px">1400px (Large)</option>
                                  <option value="1600px">1600px (Extra Large)</option>
                                  <option value="100%">100% (Full Width)</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Border Radius Style</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="0">None (0px)</option>
                                  <option value="0.125rem">Minimal (2px)</option>
                                  <option value="0.25rem">Small (4px)</option>
                                  <option value="0.5rem">Medium (8px)</option>
                                  <option value="0.75rem">Large (12px)</option>
                                  <option value="1rem">Extra Large (16px)</option>
                                </select>
                              </div>
                            </div>

                            {/* Spacing & Padding */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Spacing & Padding</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Small Spacing</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="0.25rem">4px</option>
                                    <option value="0.5rem">8px</option>
                                    <option value="0.75rem">12px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Base Spacing</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="0.75rem">12px</option>
                                    <option value="1rem">16px</option>
                                    <option value="1.25rem">20px</option>
                                    <option value="1.5rem">24px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Large Spacing</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1.25rem">20px</option>
                                    <option value="1.5rem">24px</option>
                                    <option value="2rem">32px</option>
                                    <option value="2.5rem">40px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Extra Large Spacing</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="2rem">32px</option>
                                    <option value="2.5rem">40px</option>
                                    <option value="3rem">48px</option>
                                    <option value="4rem">64px</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Responsive Breakpoints */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Responsive Breakpoints</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">📱 Mobile Breakpoint</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="480px">480px</option>
                                    <option value="640px">640px</option>
                                    <option value="768px">768px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">📲 Tablet Breakpoint</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="768px">768px</option>
                                    <option value="1024px">1024px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">💻 Desktop Breakpoint</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1024px">1024px</option>
                                    <option value="1280px">1280px</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">🖥️ Large Desktop</Label>
                                  <select className="w-full h-10 px-2 text-sm border border-gray-200 rounded-lg">
                                    <option value="1280px">1280px</option>
                                    <option value="1536px">1536px</option>
                                    <option value="1920px">1920px</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "navigation",
                        label: "Navigation",
                        content: (
                          <div className="space-y-6">
                            {/* Navigation Style */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Navigation Style</h4>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Navigation Layout</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="default">Default Horizontal</option>
                                  <option value="centered">Centered Logo & Menu</option>
                                  <option value="split">Split Logo/Menu</option>
                                  <option value="minimal">Minimal Clean</option>
                                </select>
                              </div>
                              
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Navigation Height</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="48px">Compact (48px)</option>
                                  <option value="64px">Default (64px)</option>
                                  <option value="80px">Large (80px)</option>
                                  <option value="96px">Extra Large (96px)</option>
                                </select>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Logo Size</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="32px">Small (32px)</option>
                                  <option value="40px">Medium (40px)</option>
                                  <option value="48px">Large (48px)</option>
                                  <option value="56px">Extra Large (56px)</option>
                                </select>
                              </div>

                              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                  <Label className="text-sm font-medium">Enable Drop Shadow</Label>
                                  <p className="text-xs text-muted-foreground">Add shadow below navigation</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </div>

                            {/* Navigation Colors */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Navigation Colors</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Navigation Background</Label>
                                  <p className="text-xs text-muted-foreground">Background color of the navigation bar</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#ffffff"
                                    />
                                    <Input 
                                      placeholder="#ffffff" 
                                      className="flex-1 h-12" 
                                      defaultValue="#ffffff"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Text Color</Label>
                                  <p className="text-xs text-muted-foreground">Color of navigation menu items</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#000000"
                                    />
                                    <Input 
                                      placeholder="#000000" 
                                      className="flex-1 h-12" 
                                      defaultValue="#000000"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Border Color</Label>
                                  <p className="text-xs text-muted-foreground">Color of navigation border (if any)</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#e5e7eb"
                                    />
                                    <Input 
                                      placeholder="#e5e7eb" 
                                      className="flex-1 h-12" 
                                      defaultValue="#e5e7eb"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "components",
                        label: "Components",
                        content: (
                          <div className="space-y-6">
                            {/* Card Components */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Card Components</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Card Background</Label>
                                  <p className="text-xs text-muted-foreground">Background color for content cards</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#ffffff"
                                    />
                                    <Input 
                                      placeholder="#ffffff" 
                                      className="flex-1 h-12" 
                                      defaultValue="#ffffff"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Card Border Color</Label>
                                  <p className="text-xs text-muted-foreground">Border color for content cards</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#e5e7eb"
                                    />
                                    <Input 
                                      placeholder="#e5e7eb" 
                                      className="flex-1 h-12" 
                                      defaultValue="#e5e7eb"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Card Border Radius</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="0">Square</option>
                                    <option value="0.25rem">Slightly Rounded</option>
                                    <option value="0.5rem">Rounded</option>
                                    <option value="0.75rem">More Rounded</option>
                                    <option value="1rem">Very Rounded</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Card Shadow</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="none">No Shadow</option>
                                    <option value="sm">Small Shadow</option>
                                    <option value="md">Medium Shadow</option>
                                    <option value="lg">Large Shadow</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Button Components */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Button Components</h4>
                              <div className="space-y-3">
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Button Border Radius</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="0">Square</option>
                                    <option value="0.25rem">Slightly Rounded</option>
                                    <option value="0.375rem">Default Rounded</option>
                                    <option value="0.5rem">More Rounded</option>
                                    <option value="9999px">Pill Shape</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Button Font Size</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="0.75rem">Small (12px)</option>
                                    <option value="0.875rem">Default (14px)</option>
                                    <option value="1rem">Medium (16px)</option>
                                    <option value="1.125rem">Large (18px)</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Button Padding</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="0.25rem 0.75rem">Compact</option>
                                    <option value="0.5rem 1rem">Default</option>
                                    <option value="0.75rem 1.5rem">Comfortable</option>
                                    <option value="1rem 2rem">Spacious</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Form Components */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Form Components</h4>
                              <div className="space-y-3">
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Input Border Radius</Label>
                                  <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                    <option value="0">Square</option>
                                    <option value="0.25rem">Slightly Rounded</option>
                                    <option value="0.375rem">Default Rounded</option>
                                    <option value="0.5rem">More Rounded</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Input Border Color</Label>
                                  <p className="text-xs text-muted-foreground">Border color for form inputs</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#d1d5db"
                                    />
                                    <Input 
                                      placeholder="#d1d5db" 
                                      className="flex-1 h-12" 
                                      defaultValue="#d1d5db"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Focus Color</Label>
                                  <p className="text-xs text-muted-foreground">Color when form inputs are focused</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#3b82f6"
                                    />
                                    <Input 
                                      placeholder="#3b82f6" 
                                      className="flex-1 h-12" 
                                      defaultValue="#3b82f6"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "hero",
                        label: "Hero",
                        content: (
                          <div className="space-y-6">
                            {/* Hero Section Style */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Hero Section Style</h4>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Hero Style</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="default">Default Background</option>
                                  <option value="gradient">Gradient Background</option>
                                  <option value="image">Image Background</option>
                                  <option value="video">Video Background</option>
                                </select>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Text Alignment</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="left">Left Aligned</option>
                                  <option value="center">Center Aligned</option>
                                  <option value="right">Right Aligned</option>
                                </select>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Minimum Height</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="300px">Small (300px)</option>
                                  <option value="400px">Medium (400px)</option>
                                  <option value="500px">Large (500px)</option>
                                  <option value="100vh">Full Screen</option>
                                </select>
                              </div>
                            </div>

                            {/* Overlay Settings */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Overlay Settings</h4>
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Overlay Opacity</Label>
                                  <p className="text-xs text-muted-foreground">Opacity of the overlay on background images/videos</p>
                                  <div className="px-3">
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="1" 
                                      step="0.1" 
                                      defaultValue="0.3"
                                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                      <span>0%</span>
                                      <span>30%</span>
                                      <span>100%</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Overlay Color</Label>
                                  <p className="text-xs text-muted-foreground">Color of the overlay on background media</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#000000"
                                    />
                                    <Input 
                                      placeholder="#000000" 
                                      className="flex-1 h-12" 
                                      defaultValue="#000000"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "footer",
                        label: "Footer",
                        content: (
                          <div className="space-y-6">
                            {/* Footer Style */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Footer Style</h4>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Footer Layout</Label>
                                <select className="w-full h-12 px-3 border border-gray-200 rounded-lg">
                                  <option value="simple">Simple Single Row</option>
                                  <option value="columns">Multi-Column Layout</option>
                                  <option value="centered">Centered Layout</option>
                                </select>
                              </div>
                            </div>

                            {/* Footer Colors */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Footer Colors</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Footer Background</Label>
                                  <p className="text-xs text-muted-foreground">Background color of the footer</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#1f2937"
                                    />
                                    <Input 
                                      placeholder="#1f2937" 
                                      className="flex-1 h-12" 
                                      defaultValue="#1f2937"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Footer Text Color</Label>
                                  <p className="text-xs text-muted-foreground">Text color in the footer</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#ffffff"
                                    />
                                    <Input 
                                      placeholder="#ffffff" 
                                      className="flex-1 h-12" 
                                      defaultValue="#ffffff"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Footer Border Color</Label>
                                  <p className="text-xs text-muted-foreground">Border color for footer elements</p>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      className="w-12 h-12 border-2 border-gray-200 rounded-lg"
                                      defaultValue="#374151"
                                    />
                                    <Input 
                                      placeholder="#374151" 
                                      className="flex-1 h-12" 
                                      defaultValue="#374151"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        value: "advanced",
                        label: "Advanced",
                        content: (
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label htmlFor="custom-css-mobile" className="text-sm font-medium">Custom CSS Code</Label>
                              <Textarea
                                id="custom-css-mobile"
                                value={customCSS}
                                onChange={(e) => setCustomCSS(e.target.value)}
                                placeholder="/* Enter your custom CSS here */"
                                className="min-h-[200px] font-mono text-sm"
                              />
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Tip:</strong> Use CSS variables like <code>var(--theme-primary)</code> to reference your theme colors.
                              </p>
                            </div>
                          </div>
                        )
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Subscription Management Tab */}
          {isSubscriptionEnabled && (
            <TabsContent value="subscription" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="packageType" className="text-sm font-medium">Package Type</Label>
                    <select
                      id="packageType"
                      value={packageType}
                      onChange={(e) => {
                        setPackageType(e.target.value as 'standard' | 'advanced');
                        markAsChanged();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard Package ($100/year)</option>
                      <option value="advanced">Advanced Package ($200/year)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subscriptionStart" className="text-sm font-medium">Start Date</Label>
                    <Input
                      id="subscriptionStart"
                      type="date"
                      value={subscriptionStart}
                      onChange={(e) => {
                        setSubscriptionStart(e.target.value);
                        markAsChanged();
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subscriptionEnd" className="text-sm font-medium">End Date</Label>
                    <Input
                      id="subscriptionEnd"
                      type="date"
                      value={subscriptionEnd}
                      onChange={(e) => {
                        setSubscriptionEnd(e.target.value);
                        markAsChanged();
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subscriptionStatus" className="text-sm font-medium">Status</Label>
                    <select
                      id="subscriptionStatus"
                      value={subscriptionStatus}
                      onChange={(e) => {
                        setSubscriptionStatus(e.target.value as 'active' | 'expiring' | 'inactive' | 'trial');
                        markAsChanged();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="inactive">Inactive</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Package:</span>
                      <div className="font-medium">
                        {packageType === 'advanced' ? 'Advanced ($200/year)' : 'Standard ($100/year)'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium capitalize">{subscriptionStatus}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Days until expiry:</span>
                      <div className="font-medium">
                        {subscriptionEnd 
                          ? Math.ceil((new Date(subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'
                        } days
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
          
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
                    onChange={(e) => handleContactChange('address', e.target.value)}
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
                    onChange={(e) => handleContactChange('phone', e.target.value)}
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
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="Contact email"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="map" className="text-sm font-medium">Google Maps Embed URL</Label>
                  <Input
                    id="map"
                    value={mapEmbedUrl}
                    onChange={(e) => handleContactChange('mapEmbedUrl', e.target.value)}
                    placeholder="Google Maps embed URL (optional)"
                    className="h-12 text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assignments Tab */}
          {isAdminAssignmentsEnabled && (
            <TabsContent value="assignments" className="space-y-6">
            {school && (
              <SchoolAssignmentManager 
                schoolId={school.id}
                schoolName={school.name}
                onAssignmentChange={() => {
                  // Optionally refresh school data or trigger other updates
                  toast({
                    title: "Assignment Updated",
                    description: "School admin assignments have been updated",
                  });
                }}
              />
            )}
          </TabsContent>
          )}
          
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

      {/* Bottom Navigation */}
      <BottomAppBar userRole="DSVI_ADMIN" />
    </div>
  );
}
