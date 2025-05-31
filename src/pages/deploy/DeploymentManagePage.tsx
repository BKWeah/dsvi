import React, { useState } from 'react';
import { useFeatureFlags, FeatureFlagConfig, Feature, SubFeature } from '@/contexts/FeatureFlagContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Eye, 
  EyeOff, 
  Settings2,
  FileCode,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeatureToggleProps {
  featureKey: string;
  feature: Feature | SubFeature;
  path: string;
  level: number;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ featureKey, feature, path, level }) => {
  const { isFeatureEnabled, toggleFeature } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false); // Start collapsed by default
  
  const isEnabled = isFeatureEnabled(path);
  const hasSubFeatures = 'subFeatures' in feature && feature.subFeatures;
  
  const indentClass = level === 0 ? '' : `ml-${level * 4}`;
  
  return (
    <div className={`space-y-2 ${indentClass}`}>
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        level === 0 ? 'bg-card' : level === 1 ? 'bg-muted/50' : 'bg-background'
      }`}>
        <div className="flex items-center space-x-3 flex-1">
          {hasSubFeatures && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {isOpen ? '−' : '+'}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={path} className="font-medium">
                {featureKey}
              </Label>
              {'route' in feature && feature.route && (
                <Badge variant="outline" className="text-xs">
                  {feature.route}
                </Badge>
              )}
              {'priority' in feature && feature.priority && (
                <Badge variant="secondary" className="text-xs">
                  Priority: {feature.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description}
            </p>
          </div>
        </div>
        
        <Switch
          id={path}
          checked={isEnabled}
          onCheckedChange={() => toggleFeature(path)}
        />
      </div>
      
      {hasSubFeatures && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-2">
            {Object.entries(feature.subFeatures!).map(([subKey, subFeature]) => (
              <FeatureToggle
                key={subKey}
                featureKey={subKey}
                feature={subFeature}
                path={`${path}.${subKey}`}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default function DeploymentManagePage() {
  const { 
    config, 
    updateConfig, 
    saveConfig, 
    loadConfig, 
    resetToDefaults, 
    getEnabledRoutes,
    getDefaultRoute 
  } = useFeatureFlags();
  
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify(config, null, 2));
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dsvi-feature-flags-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Config Exported",
      description: "Feature flag configuration downloaded successfully",
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          updateConfig(importedConfig);
          setJsonConfig(JSON.stringify(importedConfig, null, 2));
          toast({
            title: "Config Imported",
            description: "Feature flag configuration imported successfully",
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Invalid JSON file. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleJsonUpdate = () => {
    try {
      const newConfig = JSON.parse(jsonConfig);
      updateConfig(newConfig);
      toast({
        title: "Config Updated",
        description: "Configuration updated from JSON editor",
      });
    } catch (error) {
      toast({
        title: "JSON Error",
        description: "Invalid JSON format. Please check your syntax.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await saveConfig();
      toast({
        title: "Config Saved",
        description: "Feature flag configuration saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setJsonConfig(JSON.stringify(config, null, 2));
    toast({
      title: "Config Reset",
      description: "Feature flags reset to default values",
    });
  };

  const enabledRoutes = getEnabledRoutes();
  const defaultRoute = getDefaultRoute();

  return (    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deployment Management</h1>
          <p className="text-muted-foreground">
            Control which features are visible in production
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Exit Preview' : 'Preview Mode'}
          </Button>
          
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Config
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Enabled Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(config.features).filter(f => f.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {Object.keys(config.features).length} total features
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledRoutes.length}</div>
            <p className="text-xs text-muted-foreground">navigation routes available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Default Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono bg-muted p-2 rounded">
              {defaultRoute}
            </div>
            <p className="text-xs text-muted-foreground mt-1">login redirect destination</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            JSON Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Management</CardTitle>
              <CardDescription>
                Enable or disable features and their sub-components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.features).map(([featureKey, feature]) => (
                <FeatureToggle
                  key={featureKey}
                  featureKey={featureKey}
                  feature={feature}
                  path={featureKey}
                  level={0}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Desktop Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sidebar Navigation</Label>
                    <p className="text-sm text-muted-foreground">
                      Show sidebar on desktop devices
                    </p>
                  </div>
                  <Switch
                    checked={config.navigation.sidebar.enabled}
                    onCheckedChange={() => toggleFeature('navigation.sidebar')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Breadcrumbs</Label>
                    <p className="text-sm text-muted-foreground">
                      Show breadcrumb navigation
                    </p>
                  </div>
                  <Switch
                    checked={config.navigation.breadcrumbs.enabled}
                    onCheckedChange={() => toggleFeature('navigation.breadcrumbs')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bottom App Bar</Label>
                    <p className="text-sm text-muted-foreground">
                      Show bottom navigation on mobile
                    </p>
                  </div>
                  <Switch
                    checked={config.navigation.bottomAppBar.enabled}
                    onCheckedChange={() => toggleFeature('navigation.bottomAppBar')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enabled Routes Preview</CardTitle>
              <CardDescription>
                Current navigation structure based on enabled features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enabledRoutes.map((route, index) => (
                  <div key={route} className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {route}
                    </code>
                  </div>
                ))}
                {enabledRoutes.length === 0 && (
                  <p className="text-muted-foreground">No routes enabled</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Configuration Editor</CardTitle>
              <CardDescription>
                Edit the raw JSON configuration directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                placeholder="JSON configuration..."
              />
              
              <div className="flex gap-2">
                <Button onClick={handleJsonUpdate}>
                  Update from JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJsonConfig(JSON.stringify(config, null, 2))}
                >
                  Reset to Current
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Preview</CardTitle>
              <CardDescription>
                Preview of current feature flag configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Enabled Features</h4>
                  <div className="space-y-2">
                    {Object.entries(config.features)
                      .filter(([_, feature]) => feature.enabled)
                      .map(([key, feature]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">✓</Badge>
                          <span className="text-sm">{key}</span>
                          {feature.route && (
                            <code className="text-xs bg-muted px-1 rounded">
                              {feature.route}
                            </code>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Disabled Features</h4>
                  <div className="space-y-2">
                    {Object.entries(config.features)
                      .filter(([_, feature]) => !feature.enabled)
                      .map(([key, feature]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant="destructive">✗</Badge>
                          <span className="text-sm text-muted-foreground">{key}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-6 border-t">
        <Button onClick={handleExportConfig} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Config
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <label htmlFor="import-config" className="cursor-pointer">
            Import Config
          </label>
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={handleImportConfig}
            className="hidden"
          />
        </Button>
        
        <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        
        <div className="flex-1" />
        
        <Badge variant="secondary" className="flex items-center gap-1">
          Last Updated: {new Date(config.lastUpdated).toLocaleString()}
        </Badge>
      </div>
    </div>
  );
}