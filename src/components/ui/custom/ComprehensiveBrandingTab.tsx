import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Palette, Type, Layout, Navigation, Image, Code, RefreshCw } from 'lucide-react';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ThemePresetSelector } from './ThemePresetSelector';
import { ThemePreset } from '@/lib/theme-presets';

interface ComprehensiveBrandingTabProps {
  themeSettings: ComprehensiveThemeSettings;
  customCSS: string;
  logoUrl: string;
  onThemeChange: (theme: ComprehensiveThemeSettings) => void;
  onCustomCSSChange: (css: string) => void;
  onLogoChange: (url: string) => void;
  onPreview: () => void;
}

export const ComprehensiveBrandingTab: React.FC<ComprehensiveBrandingTabProps> = ({
  themeSettings,
  customCSS,
  logoUrl,
  onThemeChange,
  onCustomCSSChange,
  onLogoChange,
  onPreview,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('colors');
  // Color handlers
  const updateColor = (path: string, value: string) => {
    const newTheme = { ...themeSettings };
    const pathParts = path.split('.');
    
    let current = newTheme;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    onThemeChange(newTheme);
  };

  // Typography handlers
  const updateTypography = (category: string, property: string, value: string | number) => {
    const newTheme = {
      ...themeSettings,
      typography: {
        ...themeSettings.typography,
        [category]: {
          ...themeSettings.typography?.[category],
          [property]: value,
        },
      },
    };
    onThemeChange(newTheme);
  };

  // Layout handlers
  const updateLayout = (property: string, value: string) => {
    const newTheme = {
      ...themeSettings,
      layout: {
        ...themeSettings.layout,
        [property]: value,
      },
    };
    onThemeChange(newTheme);
  };

  // Preset handler
  const handlePresetSelect = (preset: ThemePreset) => {
    onThemeChange(preset.theme);
    toast({
      title: "Theme Applied",
      description: `${preset.name} theme has been applied successfully`,
    });
  };
  const ColorPicker: React.FC<{ label: string; value?: string; onChange: (value: string) => void }> = ({ 
    label, 
    value = '#000000', 
    onChange 
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 border-2"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Advanced Branding & Theme Customization</h3>
          <p className="text-sm text-muted-foreground">
            Customize every aspect of your school's public website appearance
          </p>
        </div>
        <Button onClick={onPreview} variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-1">
            <Navigation className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>
        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <ThemePresetSelector
            currentTheme={themeSettings}
            onPresetSelect={handlePresetSelect}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Primary Color"
                value={themeSettings.colors?.primary}
                onChange={(value) => updateColor('colors.primary', value)}
              />
              <ColorPicker
                label="Secondary Color"
                value={themeSettings.colors?.secondary}
                onChange={(value) => updateColor('colors.secondary', value)}
              />
              <ColorPicker
                label="Accent Color"
                value={themeSettings.colors?.accent}
                onChange={(value) => updateColor('colors.accent', value)}
              />
              <ColorPicker
                label="Background Color"
                value={themeSettings.colors?.background}
                onChange={(value) => updateColor('colors.background', value)}
              />
              <ColorPicker
                label="Surface Color"
                value={themeSettings.colors?.surface}
                onChange={(value) => updateColor('colors.surface', value)}
              />
              <ColorPicker
                label="Border Color"
                value={themeSettings.colors?.border}
                onChange={(value) => updateColor('colors.border', value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPicker
                label="Primary Text"
                value={themeSettings.colors?.text?.primary}
                onChange={(value) => updateColor('colors.text.primary', value)}
              />
              <ColorPicker
                label="Secondary Text"
                value={themeSettings.colors?.text?.secondary}
                onChange={(value) => updateColor('colors.text.secondary', value)}
              />
              <ColorPicker
                label="Muted Text"
                value={themeSettings.colors?.text?.muted}
                onChange={(value) => updateColor('colors.text.muted', value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Font Families
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Font</Label>
                <Select
                  value={themeSettings.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif'}
                  onValueChange={(value) => updateTypography('fontFamily', 'primary', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Font (Headers)</Label>
                <Select
                  value={themeSettings.typography?.fontFamily?.display || 'Inter, system-ui, sans-serif'}
                  onValueChange={(value) => updateTypography('fontFamily', 'display', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Container Max Width</Label>
                <Select
                  value={themeSettings.layout?.containerMaxWidth || '1200px'}
                  onValueChange={(value) => updateLayout('containerMaxWidth', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024px">1024px (Small)</SelectItem>
                    <SelectItem value="1200px">1200px (Medium)</SelectItem>
                    <SelectItem value="1400px">1400px (Large)</SelectItem>
                    <SelectItem value="100%">100% (Full Width)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Border Radius Style</Label>
                <Select
                  value={themeSettings.layout?.borderRadius?.base || '0.5rem'}
                  onValueChange={(value) => updateLayout('borderRadius.base', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (0px)</SelectItem>
                    <SelectItem value="0.25rem">Small (4px)</SelectItem>
                    <SelectItem value="0.5rem">Medium (8px)</SelectItem>
                    <SelectItem value="0.75rem">Large (12px)</SelectItem>
                    <SelectItem value="1rem">Extra Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Navigation Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Navigation Style</Label>
                <Select
                  value={themeSettings.navigation?.style || 'default'}
                  onValueChange={(value) => updateColor('navigation.style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="split">Split Logo/Menu</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorPicker
                label="Navigation Background"
                value={themeSettings.navigation?.background}
                onChange={(value) => updateColor('navigation.background', value)}
              />
              <ColorPicker
                label="Text Color"
                value={themeSettings.navigation?.textColor}
                onChange={(value) => updateColor('navigation.textColor', value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Card Background</Label>
                <ColorPicker
                  label=""
                  value={themeSettings.components?.cards?.background}
                  onChange={(value) => updateColor('components.cards.background', value)}
                />
              </div>
              <div>
                <Label>Button Border Radius</Label>
                <Select
                  value={themeSettings.components?.buttons?.borderRadius || '0.375rem'}
                  onValueChange={(value) => updateColor('components.buttons.borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Square</SelectItem>
                    <SelectItem value="0.25rem">Slightly Rounded</SelectItem>
                    <SelectItem value="0.375rem">Rounded</SelectItem>
                    <SelectItem value="0.5rem">More Rounded</SelectItem>
                    <SelectItem value="9999px">Pill Shape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Custom CSS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add custom CSS to override styles and create unique designs
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS Code</Label>
                <Textarea
                  id="custom-css"
                  value={customCSS}
                  onChange={(e) => onCustomCSSChange(e.target.value)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};