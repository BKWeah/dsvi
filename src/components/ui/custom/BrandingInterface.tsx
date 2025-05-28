import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Settings, Download, Upload, RotateCcw, Save } from 'lucide-react';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { ComprehensiveBrandingTab } from './ComprehensiveBrandingTab';
import { ThemePreview } from './ThemePreview';
import { useTheme } from '@/hooks/use-theme';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BrandingInterfaceProps {
  initialTheme?: ComprehensiveThemeSettings;
  initialCustomCSS?: string;
  initialLogoUrl?: string;
  schoolName?: string;
  onThemeChange?: (theme: ComprehensiveThemeSettings) => void;
  onCustomCSSChange?: (css: string) => void;
  onLogoChange?: (url: string) => void;
  onSave?: (theme: ComprehensiveThemeSettings, customCSS: string, logoUrl: string) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export const BrandingInterface: React.FC<BrandingInterfaceProps> = ({
  initialTheme,
  initialCustomCSS = '',
  initialLogoUrl = '',
  schoolName = 'Your School Name',
  onThemeChange,
  onCustomCSSChange,
  onLogoChange,
  onSave,
  onUnsavedChanges,
}) => {
  const {
    theme,
    customCSS,
    setTheme,
    setCustomCSS,
    resetTheme,
    exportTheme,
    importTheme,
    applyTheme,
    validateTheme,
    isThemeValid,
  } = useTheme({
    initialTheme,
    customCSS: initialCustomCSS,
    autoApply: false, // We'll control when to apply
  });

  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle theme changes
  const handleThemeChange = (newTheme: ComprehensiveThemeSettings) => {
    setTheme(newTheme);
    setHasUnsavedChanges(true);
    onThemeChange?.(newTheme);
    onUnsavedChanges?.(true);
  };

  // Handle custom CSS changes
  const handleCustomCSSChange = (css: string) => {
    setCustomCSS(css);
    setHasUnsavedChanges(true);
    onCustomCSSChange?.(css);
    onUnsavedChanges?.(true);
  };

  // Handle logo changes
  const handleLogoChange = (url: string) => {
    setLogoUrl(url);
    setHasUnsavedChanges(true);
    onLogoChange?.(url);
    onUnsavedChanges?.(true);
  };

  // Handle preview
  const handlePreview = () => {
    applyTheme();
    setShowPreview(true);
  };

  // Handle save
  const handleSave = () => {
    if (isThemeValid) {
      onSave?.(theme, customCSS, logoUrl);
      setHasUnsavedChanges(false);
      onUnsavedChanges?.(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    resetTheme();
    setLogoUrl('');
    setHasUnsavedChanges(false);
    onUnsavedChanges?.(false);
  };

  // Handle export
  const handleExport = () => {
    const themeData = {
      theme,
      customCSS,
      logoUrl,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schoolName.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.theme) {
            setTheme(data.theme);
          }
          if (data.customCSS) {
            setCustomCSS(data.customCSS);
          }
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
          
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to import theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  const validationErrors = validateTheme();

  return (
    <div className="space-y-6">
      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <style jsx>{`
            @keyframes rainbow-border {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .rainbow-border {
              background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
              background-size: 400%;
              animation: rainbow-border 2s ease infinite;
              padding: 2px;
              border-radius: 50px;
            }
            .save-button-inner {
              background: white;
              border-radius: 48px;
              padding: 12px 24px;
              font-weight: 600;
              color: #1f2937;
              transition: all 0.2s ease;
            }
            .save-button-inner:hover {
              background: #f9fafb;
              transform: translateY(-1px);
            }
          `}</style>
          <div className="rainbow-border">
            <Button
              onClick={handleSave}
              disabled={!isThemeValid}
              className="save-button-inner flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ background: 'white', color: '#1f2937' }}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">School Branding & Theme Customization</h2>
          <p className="text-muted-foreground">
            Customize your school's public website appearance and branding
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <label className="cursor-pointer">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              asChild
            >
              <span>
                <Upload className="h-4 w-4" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button 
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Theme Preview
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      Tablet
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      Mobile
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div 
                className="mx-auto transition-all duration-300"
                style={{ width: getPreviewWidth() }}
              >
                <ThemePreview
                  theme={theme}
                  logoUrl={logoUrl}
                  schoolName={schoolName}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 text-sm">Theme Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Theme Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <ComprehensiveBrandingTab
            themeSettings={theme}
            customCSS={customCSS}
            logoUrl={logoUrl}
            onThemeChange={handleThemeChange}
            onCustomCSSChange={handleCustomCSSChange}
            onLogoChange={handleLogoChange}
            onPreview={handlePreview}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                Desktop
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                Tablet
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                Mobile
              </Button>
            </div>
          </div>
          
          <div 
            className="mx-auto transition-all duration-300"
            style={{ width: getPreviewWidth() }}
          >
            <ThemePreview
              theme={theme}
              logoUrl={logoUrl}
              schoolName={schoolName}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};