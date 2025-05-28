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
import { 
  Eye, Palette, Type, Layout, Navigation, Image, Code, RefreshCw, 
  Upload, Monitor, Tablet, Smartphone, Home, Hash, Minus, Plus
} from 'lucide-react';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ThemePresetSelector } from './ThemePresetSelector';
import { ColorPaletteGenerator } from './ColorPaletteGenerator';
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

  // Helper function to safely update nested properties
  const updateNestedProperty = (path: string, value: string | number | boolean) => {
    const newTheme = { ...themeSettings };
    const pathParts = path.split('.');
    
    let current = newTheme as any;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    onThemeChange(newTheme);
  };

  // Color handlers
  const updateColor = (path: string, value: string) => {
    updateNestedProperty(path, value);
  };

  // Typography handlers
  const updateTypography = (category: string, property: string, value: string | number) => {
    updateNestedProperty(`typography.${category}.${property}`, value);
  };

  // Layout handlers
  const updateLayout = (property: string, value: string) => {
    updateNestedProperty(`layout.${property}`, value);
  };

  // Navigation handlers
  const updateNavigation = (property: string, value: string | boolean) => {
    updateNestedProperty(`navigation.${property}`, value);
  };

  // Component handlers
  const updateComponent = (category: string, property: string, value: string) => {
    updateNestedProperty(`components.${category}.${property}`, value);
  };

  // Hero handlers
  const updateHero = (property: string, value: string | number) => {
    updateNestedProperty(`hero.${property}`, value);
  };

  // Footer handlers
  const updateFooter = (property: string, value: string) => {
    updateNestedProperty(`footer.${property}`, value);
  };

  // Preset handler
  const handlePresetSelect = (preset: ThemePreset) => {
    onThemeChange(preset.theme);
    toast({
      title: "Theme Applied",
      description: `${preset.name} theme has been applied successfully`,
    });
  };

  // Color palette handler
  const handlePaletteSelect = (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  }) => {
    const newTheme = {
      ...themeSettings,
      colors: {
        ...themeSettings.colors,
        ...colors,
      },
    };
    onThemeChange(newTheme);
    toast({
      title: "Palette Applied",
      description: "Color palette has been applied to your theme",
    });
  };

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        toast({
          title: "Logo Uploaded",
          description: "Your logo has been uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const ColorPicker: React.FC<{ 
    label: string; 
    value?: string; 
    onChange: (value: string) => void;
    description?: string;
  }> = ({ 
    label, 
    value = '#000000', 
    onChange,
    description 
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
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

  const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    unit?: string;
    description?: string;
  }> = ({ label, value, min, max, step, onChange, unit = '', description }) => {
    const handleIncrement = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    };

    const handleDecrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={value <= min}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={value.toString()}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              className="w-20 h-8 text-center text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              disabled={value >= max}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-0">{unit}</span>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(values) => onChange(values[0])}
          className="w-full"
        />
      </div>
    );
  };

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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="colors" className="flex items-center gap-1 text-xs">
            <Palette className="h-3 w-3" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1 text-xs">
            <Type className="h-3 w-3" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1 text-xs">
            <Layout className="h-3 w-3" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-1 text-xs">
            <Navigation className="h-3 w-3" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-1 text-xs">
            <Image className="h-3 w-3" />
            Components
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-1 text-xs">
            <Home className="h-3 w-3" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-1 text-xs">
            <Hash className="h-3 w-3" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1 text-xs">
            <Code className="h-3 w-3" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <ThemePresetSelector
            currentTheme={themeSettings}
            onPresetSelect={handlePresetSelect}
          />
          
          <ColorPaletteGenerator
            onPaletteSelect={handlePaletteSelect}
          />
          
          {/* Logo Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Logo & Branding Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">School Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {logoUrl && (
                    <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={logoUrl} 
                        alt="School Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload PNG, JPG, or SVG. Recommended size: 200x200px
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Logo URL (Alternative)</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => onLogoChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
          
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
                description="Main brand color for buttons, links, and highlights"
              />
              <ColorPicker
                label="Secondary Color"
                value={themeSettings.colors?.secondary}
                onChange={(value) => updateColor('colors.secondary', value)}
                description="Supporting brand color for accents"
              />
              <ColorPicker
                label="Accent Color"
                value={themeSettings.colors?.accent}
                onChange={(value) => updateColor('colors.accent', value)}
                description="Color for call-to-action elements"
              />
              <ColorPicker
                label="Background Color"
                value={themeSettings.colors?.background}
                onChange={(value) => updateColor('colors.background', value)}
                description="Main background color of the website"
              />
              <ColorPicker
                label="Surface Color"
                value={themeSettings.colors?.surface}
                onChange={(value) => updateColor('colors.surface', value)}
                description="Color for cards and elevated surfaces"
              />
              <ColorPicker
                label="Border Color"
                value={themeSettings.colors?.border}
                onChange={(value) => updateColor('colors.border', value)}
                description="Color for borders and dividers"
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
                description="Main text color for headings and important content"
              />
              <ColorPicker
                label="Secondary Text"
                value={themeSettings.colors?.text?.secondary}
                onChange={(value) => updateColor('colors.text.secondary', value)}
                description="Secondary text color for body content"
              />
              <ColorPicker
                label="Muted Text"
                value={themeSettings.colors?.text?.muted}
                onChange={(value) => updateColor('colors.text.muted', value)}
                description="Muted text color for captions and less important text"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPicker
                label="Success Color"
                value={themeSettings.colors?.success || '#10b981'}
                onChange={(value) => updateColor('colors.success', value)}
                description="Color for success messages and confirmations"
              />
              <ColorPicker
                label="Warning Color"
                value={themeSettings.colors?.warning || '#f59e0b'}
                onChange={(value) => updateColor('colors.warning', value)}
                description="Color for warnings and caution messages"
              />
              <ColorPicker
                label="Error Color"
                value={themeSettings.colors?.error || '#ef4444'}
                onChange={(value) => updateColor('colors.error', value)}
                description="Color for error messages and alerts"
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
                    <SelectItem value="'Source Sans Pro', sans-serif">Source Sans Pro</SelectItem>
                    <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
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
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                    <SelectItem value="'Merriweather', serif">Merriweather</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Secondary Font (Optional)</Label>
                <Select
                  value={themeSettings.typography?.fontFamily?.secondary || 'Inter, system-ui, sans-serif'}
                  onValueChange={(value) => updateTypography('fontFamily', 'secondary', value)}
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Sizes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Base Font Size</Label>
                <Select
                  value={themeSettings.typography?.fontSize?.base || '1rem'}
                  onValueChange={(value) => updateTypography('fontSize', 'base', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.875rem">14px (Small)</SelectItem>
                    <SelectItem value="1rem">16px (Default)</SelectItem>
                    <SelectItem value="1.125rem">18px (Large)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Large Text Size</Label>
                <Select
                  value={themeSettings.typography?.fontSize?.lg || '1.125rem'}
                  onValueChange={(value) => updateTypography('fontSize', 'lg', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1rem">16px</SelectItem>
                    <SelectItem value="1.125rem">18px</SelectItem>
                    <SelectItem value="1.25rem">20px</SelectItem>
                    <SelectItem value="1.375rem">22px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Extra Large Size</Label>
                <Select
                  value={themeSettings.typography?.fontSize?.xl || '1.25rem'}
                  onValueChange={(value) => updateTypography('fontSize', 'xl', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.125rem">18px</SelectItem>
                    <SelectItem value="1.25rem">20px</SelectItem>
                    <SelectItem value="1.5rem">24px</SelectItem>
                    <SelectItem value="1.75rem">28px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heading Size (2XL)</Label>
                <Select
                  value={themeSettings.typography?.fontSize?.['2xl'] || '1.5rem'}
                  onValueChange={(value) => updateTypography('fontSize', '2xl', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.25rem">20px</SelectItem>
                    <SelectItem value="1.5rem">24px</SelectItem>
                    <SelectItem value="1.875rem">30px</SelectItem>
                    <SelectItem value="2.25rem">36px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Weights & Line Heights</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Normal Weight</Label>
                <Select
                  value={String(themeSettings.typography?.fontWeight?.normal || 400)}
                  onValueChange={(value) => updateTypography('fontWeight', 'normal', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">Light (300)</SelectItem>
                    <SelectItem value="400">Normal (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bold Weight</Label>
                <Select
                  value={String(themeSettings.typography?.fontWeight?.bold || 700)}
                  onValueChange={(value) => updateTypography('fontWeight', 'bold', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="600">Semi-bold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                    <SelectItem value="800">Extra Bold (800)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Normal Line Height</Label>
                <Select
                  value={String(themeSettings.typography?.lineHeight?.normal || 1.5)}
                  onValueChange={(value) => updateTypography('lineHeight', 'normal', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.25">Tight (1.25)</SelectItem>
                    <SelectItem value="1.5">Normal (1.5)</SelectItem>
                    <SelectItem value="1.75">Relaxed (1.75)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heading Line Height</Label>
                <Select
                  value={String(themeSettings.typography?.lineHeight?.tight || 1.25)}
                  onValueChange={(value) => updateTypography('lineHeight', 'tight', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Very Tight (1.0)</SelectItem>
                    <SelectItem value="1.1">Tight (1.1)</SelectItem>
                    <SelectItem value="1.25">Normal (1.25)</SelectItem>
                    <SelectItem value="1.375">Relaxed (1.375)</SelectItem>
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
                    <SelectItem value="1600px">1600px (Extra Large)</SelectItem>
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
                    <SelectItem value="0.125rem">Minimal (2px)</SelectItem>
                    <SelectItem value="0.25rem">Small (4px)</SelectItem>
                    <SelectItem value="0.5rem">Medium (8px)</SelectItem>
                    <SelectItem value="0.75rem">Large (12px)</SelectItem>
                    <SelectItem value="1rem">Extra Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing & Padding</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Small Spacing</Label>
                <Select
                  value={themeSettings.layout?.spacing?.sm || '0.5rem'}
                  onValueChange={(value) => updateLayout('spacing.sm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25rem">4px</SelectItem>
                    <SelectItem value="0.5rem">8px</SelectItem>
                    <SelectItem value="0.75rem">12px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Spacing</Label>
                <Select
                  value={themeSettings.layout?.spacing?.base || '1rem'}
                  onValueChange={(value) => updateLayout('spacing.base', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.75rem">12px</SelectItem>
                    <SelectItem value="1rem">16px</SelectItem>
                    <SelectItem value="1.25rem">20px</SelectItem>
                    <SelectItem value="1.5rem">24px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Large Spacing</Label>
                <Select
                  value={themeSettings.layout?.spacing?.lg || '1.5rem'}
                  onValueChange={(value) => updateLayout('spacing.lg', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.25rem">20px</SelectItem>
                    <SelectItem value="1.5rem">24px</SelectItem>
                    <SelectItem value="2rem">32px</SelectItem>
                    <SelectItem value="2.5rem">40px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Extra Large Spacing</Label>
                <Select
                  value={themeSettings.layout?.spacing?.xl || '2rem'}
                  onValueChange={(value) => updateLayout('spacing.xl', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2rem">32px</SelectItem>
                    <SelectItem value="2.5rem">40px</SelectItem>
                    <SelectItem value="3rem">48px</SelectItem>
                    <SelectItem value="4rem">64px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Responsive Breakpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Breakpoint
                </Label>
                <Select
                  value={themeSettings.layout?.breakpoints?.sm || '640px'}
                  onValueChange={(value) => updateLayout('breakpoints.sm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480px">480px</SelectItem>
                    <SelectItem value="640px">640px</SelectItem>
                    <SelectItem value="768px">768px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  Tablet Breakpoint
                </Label>
                <Select
                  value={themeSettings.layout?.breakpoints?.md || '768px'}
                  onValueChange={(value) => updateLayout('breakpoints.md', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="768px">768px</SelectItem>
                    <SelectItem value="1024px">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Desktop Breakpoint</Label>
                <Select
                  value={themeSettings.layout?.breakpoints?.lg || '1024px'}
                  onValueChange={(value) => updateLayout('breakpoints.lg', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024px">1024px</SelectItem>
                    <SelectItem value="1280px">1280px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Large Desktop</Label>
                <Select
                  value={themeSettings.layout?.breakpoints?.xl || '1280px'}
                  onValueChange={(value) => updateLayout('breakpoints.xl', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280px">1280px</SelectItem>
                    <SelectItem value="1536px">1536px</SelectItem>
                    <SelectItem value="1920px">1920px</SelectItem>
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
                <Label>Navigation Layout</Label>
                <Select
                  value={themeSettings.navigation?.style || 'default'}
                  onValueChange={(value) => updateNavigation('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Horizontal</SelectItem>
                    <SelectItem value="centered">Centered Logo & Menu</SelectItem>
                    <SelectItem value="split">Split Logo/Menu</SelectItem>
                    <SelectItem value="minimal">Minimal Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Navigation Height</Label>
                <Select
                  value={themeSettings.navigation?.height || '64px'}
                  onValueChange={(value) => updateNavigation('height', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48px">Compact (48px)</SelectItem>
                    <SelectItem value="64px">Default (64px)</SelectItem>
                    <SelectItem value="80px">Large (80px)</SelectItem>
                    <SelectItem value="96px">Extra Large (96px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Logo Size</Label>
                <Select
                  value={themeSettings.navigation?.logoSize || '40px'}
                  onValueChange={(value) => updateNavigation('logoSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="32px">Small (32px)</SelectItem>
                    <SelectItem value="40px">Medium (40px)</SelectItem>
                    <SelectItem value="48px">Large (48px)</SelectItem>
                    <SelectItem value="56px">Extra Large (56px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="nav-shadow"
                  checked={themeSettings.navigation?.dropShadow ?? true}
                  onCheckedChange={(checked) => updateNavigation('dropShadow', checked)}
                />
                <Label htmlFor="nav-shadow">Enable Drop Shadow</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="Navigation Background"
                value={themeSettings.navigation?.background || '#ffffff'}
                onChange={(value) => updateNavigation('background', value)}
                description="Background color of the navigation bar"
              />
              <ColorPicker
                label="Text Color"
                value={themeSettings.navigation?.textColor || '#000000'}
                onChange={(value) => updateNavigation('textColor', value)}
                description="Color of navigation menu items"
              />
              <ColorPicker
                label="Border Color"
                value={themeSettings.navigation?.borderColor || '#e5e7eb'}
                onChange={(value) => updateNavigation('borderColor', value)}
                description="Color of navigation border (if any)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Card Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="Card Background"
                value={themeSettings.components?.cards?.background || '#ffffff'}
                onChange={(value) => updateComponent('cards', 'background', value)}
                description="Background color for content cards"
              />
              <ColorPicker
                label="Card Border Color"
                value={themeSettings.components?.cards?.borderColor || '#e5e7eb'}
                onChange={(value) => updateComponent('cards', 'borderColor', value)}
                description="Border color for content cards"
              />
              <div>
                <Label>Card Border Radius</Label>
                <Select
                  value={themeSettings.components?.cards?.borderRadius || '0.5rem'}
                  onValueChange={(value) => updateComponent('cards', 'borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Square</SelectItem>
                    <SelectItem value="0.25rem">Slightly Rounded</SelectItem>
                    <SelectItem value="0.5rem">Rounded</SelectItem>
                    <SelectItem value="0.75rem">More Rounded</SelectItem>
                    <SelectItem value="1rem">Very Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Card Shadow</Label>
                <Select
                  value={themeSettings.components?.cards?.shadow || 'sm'}
                  onValueChange={(value) => updateComponent('cards', 'shadow', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Shadow</SelectItem>
                    <SelectItem value="sm">Small Shadow</SelectItem>
                    <SelectItem value="md">Medium Shadow</SelectItem>
                    <SelectItem value="lg">Large Shadow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Button Border Radius</Label>
                <Select
                  value={themeSettings.components?.buttons?.borderRadius || '0.375rem'}
                  onValueChange={(value) => updateComponent('buttons', 'borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Square</SelectItem>
                    <SelectItem value="0.25rem">Slightly Rounded</SelectItem>
                    <SelectItem value="0.375rem">Default Rounded</SelectItem>
                    <SelectItem value="0.5rem">More Rounded</SelectItem>
                    <SelectItem value="9999px">Pill Shape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Button Font Size</Label>
                <Select
                  value={themeSettings.components?.buttons?.fontSize || '0.875rem'}
                  onValueChange={(value) => updateComponent('buttons', 'fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.75rem">Small (12px)</SelectItem>
                    <SelectItem value="0.875rem">Default (14px)</SelectItem>
                    <SelectItem value="1rem">Medium (16px)</SelectItem>
                    <SelectItem value="1.125rem">Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Button Padding</Label>
                <Select
                  value={themeSettings.components?.buttons?.padding || '0.5rem 1rem'}
                  onValueChange={(value) => updateComponent('buttons', 'padding', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25rem 0.75rem">Compact</SelectItem>
                    <SelectItem value="0.5rem 1rem">Default</SelectItem>
                    <SelectItem value="0.75rem 1.5rem">Comfortable</SelectItem>
                    <SelectItem value="1rem 2rem">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Input Border Radius</Label>
                <Select
                  value={themeSettings.components?.forms?.borderRadius || '0.375rem'}
                  onValueChange={(value) => updateComponent('forms', 'borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Square</SelectItem>
                    <SelectItem value="0.25rem">Slightly Rounded</SelectItem>
                    <SelectItem value="0.375rem">Default Rounded</SelectItem>
                    <SelectItem value="0.5rem">More Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorPicker
                label="Input Border Color"
                value={themeSettings.components?.forms?.borderColor || '#d1d5db'}
                onChange={(value) => updateComponent('forms', 'borderColor', value)}
                description="Border color for form inputs"
              />
              <ColorPicker
                label="Focus Color"
                value={themeSettings.components?.forms?.focusColor || '#3b82f6'}
                onChange={(value) => updateComponent('forms', 'focusColor', value)}
                description="Color when form inputs are focused"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Hero Section Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Style</Label>
                <Select
                  value={themeSettings.hero?.style || 'default'}
                  onValueChange={(value) => updateHero('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Background</SelectItem>
                    <SelectItem value="gradient">Gradient Background</SelectItem>
                    <SelectItem value="image">Image Background</SelectItem>
                    <SelectItem value="video">Video Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Text Alignment</Label>
                <Select
                  value={themeSettings.hero?.textAlign || 'center'}
                  onValueChange={(value) => updateHero('textAlign', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Aligned</SelectItem>
                    <SelectItem value="center">Center Aligned</SelectItem>
                    <SelectItem value="right">Right Aligned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Minimum Height</Label>
                <Select
                  value={themeSettings.hero?.minHeight || '400px'}
                  onValueChange={(value) => updateHero('minHeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300px">Small (300px)</SelectItem>
                    <SelectItem value="400px">Medium (400px)</SelectItem>
                    <SelectItem value="500px">Large (500px)</SelectItem>
                    <SelectItem value="100vh">Full Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <SliderControl
                label="Overlay Opacity"
                value={themeSettings.hero?.overlayOpacity || 0.3}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateHero('overlayOpacity', value)}
                description="Opacity of the overlay on background images/videos"
              />

              <ColorPicker
                label="Overlay Color"
                value={themeSettings.hero?.overlayColor || '#000000'}
                onChange={(value) => updateHero('overlayColor', value)}
                description="Color of the overlay on background media"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Section Tab */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Footer Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Footer Layout</Label>
                <Select
                  value={themeSettings.footer?.style || 'simple'}
                  onValueChange={(value) => updateFooter('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Single Row</SelectItem>
                    <SelectItem value="columns">Multi-Column Layout</SelectItem>
                    <SelectItem value="centered">Centered Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ColorPicker
                label="Footer Background"
                value={themeSettings.footer?.background || '#1f2937'}
                onChange={(value) => updateFooter('background', value)}
                description="Background color of the footer"
              />

              <ColorPicker
                label="Footer Text Color"
                value={themeSettings.footer?.textColor || '#ffffff'}
                onChange={(value) => updateFooter('textColor', value)}
                description="Text color in the footer"
              />

              <ColorPicker
                label="Footer Border Color"
                value={themeSettings.footer?.borderColor || '#374151'}
                onChange={(value) => updateFooter('borderColor', value)}
                description="Border color for footer elements"
              />
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
}

/* Use CSS variables for theme colors */
:root {
  --theme-primary: #{themeSettings.colors?.primary || '#3b82f6'};
  --theme-secondary: #{themeSettings.colors?.secondary || '#64748b'};
  --theme-accent: #{themeSettings.colors?.accent || '#10b981'};
}

.custom-element {
  color: var(--theme-primary);
  background-color: var(--theme-secondary);
}"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Use CSS variables like <code>var(--theme-primary)</code> to reference your theme colors. 
                  Variables are automatically generated from your theme settings.
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="text-lg font-semibold mb-3">CSS Variable Reference</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h5 className="font-medium">Colors:</h5>
                    <div className="space-y-1 text-xs font-mono bg-gray-50 p-3 rounded">
                      <div>--theme-primary</div>
                      <div>--theme-secondary</div>
                      <div>--theme-accent</div>
                      <div>--theme-background</div>
                      <div>--theme-surface</div>
                      <div>--theme-border</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Typography:</h5>
                    <div className="space-y-1 text-xs font-mono bg-gray-50 p-3 rounded">
                      <div>--font-primary</div>
                      <div>--font-display</div>
                      <div>--font-size-base</div>
                      <div>--font-weight-normal</div>
                      <div>--line-height-normal</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">CSS Export & Import</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const cssContent = generateFullCSS();
                        navigator.clipboard.writeText(cssContent);
                        toast({
                          title: "CSS Copied",
                          description: "Full CSS has been copied to clipboard",
                        });
                      }}
                    >
                      Copy Full CSS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const themeJson = JSON.stringify(themeSettings, null, 2);
                        navigator.clipboard.writeText(themeJson);
                        toast({
                          title: "Theme Exported",
                          description: "Theme configuration copied to clipboard",
                        });
                      }}
                    >
                      Export Theme
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-import">Import Theme JSON</Label>
                  <Textarea
                    id="theme-import"
                    placeholder="Paste theme JSON configuration here to import..."
                    className="min-h-[100px] font-mono text-sm"
                    onBlur={(e) => {
                      try {
                        if (e.target.value.trim()) {
                          const importedTheme = JSON.parse(e.target.value);
                          onThemeChange(importedTheme);
                          e.target.value = '';
                          toast({
                            title: "Theme Imported",
                            description: "Theme configuration has been imported successfully",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Import Failed",
                          description: "Invalid JSON format. Please check your theme configuration.",
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Helper function to generate full CSS from theme settings
  function generateFullCSS(): string {
    const theme = themeSettings;
    return `
/* Generated CSS from Theme Settings */
:root {
  /* Colors */
  --theme-primary: ${theme.colors?.primary || '#3b82f6'};
  --theme-secondary: ${theme.colors?.secondary || '#64748b'};
  --theme-accent: ${theme.colors?.accent || '#10b981'};
  --theme-background: ${theme.colors?.background || '#ffffff'};
  --theme-surface: ${theme.colors?.surface || '#f8fafc'};
  --theme-border: ${theme.colors?.border || '#e2e8f0'};
  --theme-text-primary: ${theme.colors?.text?.primary || '#0f172a'};
  --theme-text-secondary: ${theme.colors?.text?.secondary || '#475569'};
  --theme-text-muted: ${theme.colors?.text?.muted || '#94a3b8'};
  --theme-success: ${theme.colors?.success || '#10b981'};
  --theme-warning: ${theme.colors?.warning || '#f59e0b'};
  --theme-error: ${theme.colors?.error || '#ef4444'};
  
  /* Typography */
  --font-primary: ${theme.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif'};
  --font-display: ${theme.typography?.fontFamily?.display || 'Inter, system-ui, sans-serif'};
  --font-secondary: ${theme.typography?.fontFamily?.secondary || 'Inter, system-ui, sans-serif'};
  --font-size-base: ${theme.typography?.fontSize?.base || '1rem'};
  --font-size-lg: ${theme.typography?.fontSize?.lg || '1.125rem'};
  --font-size-xl: ${theme.typography?.fontSize?.xl || '1.25rem'};
  --font-size-2xl: ${theme.typography?.fontSize?.['2xl'] || '1.5rem'};
  --font-weight-normal: ${theme.typography?.fontWeight?.normal || 400};
  --font-weight-bold: ${theme.typography?.fontWeight?.bold || 700};
  --line-height-normal: ${theme.typography?.lineHeight?.normal || 1.5};
  --line-height-tight: ${theme.typography?.lineHeight?.tight || 1.25};
  
  /* Layout */
  --container-max-width: ${theme.layout?.containerMaxWidth || '1200px'};
  --border-radius-sm: ${theme.layout?.borderRadius?.sm || '0.25rem'};
  --border-radius-base: ${theme.layout?.borderRadius?.base || '0.5rem'};
  --border-radius-lg: ${theme.layout?.borderRadius?.lg || '0.75rem'};
  --spacing-sm: ${theme.layout?.spacing?.sm || '0.5rem'};
  --spacing-base: ${theme.layout?.spacing?.base || '1rem'};
  --spacing-lg: ${theme.layout?.spacing?.lg || '1.5rem'};
  --spacing-xl: ${theme.layout?.spacing?.xl || '2rem'};
}

/* Apply theme to common elements */
body {
  font-family: var(--font-primary);
  background-color: var(--theme-background);
  color: var(--theme-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-base);
}

/* Navigation Styles */
.navigation {
  background-color: ${theme.navigation?.background || '#ffffff'};
  color: ${theme.navigation?.textColor || '#000000'};
  height: ${theme.navigation?.height || '64px'};
  border-bottom: 1px solid ${theme.navigation?.borderColor || '#e5e7eb'};
  ${theme.navigation?.dropShadow !== false ? 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);' : ''}
}

.navigation .logo {
  height: ${theme.navigation?.logoSize || '40px'};
}

/* Component Styles */
.card {
  background-color: ${theme.components?.cards?.background || '#ffffff'};
  border: 1px solid ${theme.components?.cards?.borderColor || '#e5e7eb'};
  border-radius: ${theme.components?.cards?.borderRadius || '0.5rem'};
  ${theme.components?.cards?.shadow ? `box-shadow: var(--shadow-${theme.components?.cards?.shadow});` : ''}
}

.button {
  border-radius: ${theme.components?.buttons?.borderRadius || '0.375rem'};
  font-size: ${theme.components?.buttons?.fontSize || '0.875rem'};
  padding: ${theme.components?.buttons?.padding || '0.5rem 1rem'};
  background-color: var(--theme-primary);
  color: white;
  border: none;
  cursor: pointer;
}

.button:hover {
  opacity: 0.9;
}

/* Form Styles */
input, textarea, select {
  border-radius: ${theme.components?.forms?.borderRadius || '0.375rem'};
  border: 1px solid ${theme.components?.forms?.borderColor || '#d1d5db'};
  padding: var(--spacing-sm);
}

input:focus, textarea:focus, select:focus {
  outline: 2px solid ${theme.components?.forms?.focusColor || '#3b82f6'};
  outline-offset: -2px;
}

/* Hero Section */
.hero {
  min-height: ${theme.hero?.minHeight || '400px'};
  text-align: ${theme.hero?.textAlign || 'center'};
  position: relative;
}

.hero-overlay {
  background-color: ${theme.hero?.overlayColor || '#000000'};
  opacity: ${theme.hero?.overlayOpacity || 0.3};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Footer */
.footer {
  background-color: ${theme.footer?.background || '#1f2937'};
  color: ${theme.footer?.textColor || '#ffffff'};
  border-top: 1px solid ${theme.footer?.borderColor || '#374151'};
}

/* Custom CSS */
${customCSS}
    `.trim();
  }
};