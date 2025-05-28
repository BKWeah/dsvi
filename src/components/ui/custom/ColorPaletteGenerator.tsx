import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorPaletteGeneratorProps {
  onPaletteSelect?: (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  }) => void;
}

interface ColorPalette {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  };
}

const predefinedPalettes: ColorPalette[] = [
  {
    name: 'Ocean Blue',
    description: 'Professional and trustworthy',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
    },
  },
  {
    name: 'Forest Green',
    description: 'Natural and growth-focused',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      surface: '#ffffff',
      border: '#dcfce7',
    },
  },
  {
    name: 'Royal Purple',
    description: 'Creative and prestigious',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a855f7',
      background: '#faf5ff',
      surface: '#ffffff',
      border: '#e9d5ff',
    },
  },
  {
    name: 'Warm Orange',
    description: 'Energetic and welcoming',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fff7ed',
      surface: '#ffffff',
      border: '#fed7aa',
    },
  },
  {
    name: 'Deep Teal',
    description: 'Modern and sophisticated',
    colors: {
      primary: '#0d9488',
      secondary: '#0f766e',
      accent: '#14b8a6',
      background: '#f0fdfa',
      surface: '#ffffff',
      border: '#ccfbf1',
    },
  },
  {
    name: 'Crimson Red',
    description: 'Bold and dynamic',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#ef4444',
      background: '#fef2f2',
      surface: '#ffffff',
      border: '#fecaca',
    },
  },
];

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({
  onPaletteSelect,
}) => {
  const { toast } = useToast();
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [customPrimary, setCustomPrimary] = useState('#3b82f6');
  const [generatedPalette, setGeneratedPalette] = useState<ColorPalette | null>(null);

  // Generate palette from primary color
  const generateFromPrimary = (primaryColor: string) => {
    // Convert hex to HSL for manipulation
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [h * 360, s * 100, l * 100];
    };

    // Convert HSL to hex
    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360;
      s /= 100;
      l /= 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const [h, s, l] = hexToHsl(primaryColor);

    // Generate related colors
    const secondary = hslToHex(h, Math.max(s - 10, 0), Math.max(l - 15, 0));
    const accent = hslToHex((h + 30) % 360, s, Math.min(l + 10, 90));
    const background = hslToHex(h, Math.max(s - 40, 0), Math.min(l + 45, 97));
    const surface = '#ffffff';
    const border = hslToHex(h, Math.max(s - 30, 0), Math.min(l + 35, 90));

    return {
      name: 'Generated Palette',
      description: 'Generated from your primary color',
      colors: {
        primary: primaryColor,
        secondary,
        accent,
        background,
        surface,
        border,
      },
    };
  };

  const handleGenerateFromPrimary = () => {
    const palette = generateFromPrimary(customPrimary);
    setGeneratedPalette(palette);
    setSelectedPalette(palette);
  };

  const handlePaletteSelect = (palette: ColorPalette) => {
    setSelectedPalette(palette);
    onPaletteSelect?.(palette.colors);
  };

  const copyColorToClipboard = (color: string, colorName: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: 'Color Copied',
      description: `${colorName} color (${color}) copied to clipboard`,
    });
  };

  const ColorSwatch: React.FC<{ 
    color: string; 
    name: string; 
    size?: 'sm' | 'md' | 'lg' 
  }> = ({ color, name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
    };

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => copyColorToClipboard(color, name)}
          className={`${sizeClasses[size]} rounded-lg border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer`}
          style={{ backgroundColor: color }}
          title={`Click to copy ${name}: ${color}`}
        />
        <div className="text-center">
          <p className="text-xs font-medium capitalize">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{color}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Palette Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a pre-designed palette or generate one from your primary color
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Pre-designed Palettes</TabsTrigger>
            <TabsTrigger value="generator">Generate Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedPalettes.map((palette) => (
                <Card 
                  key={palette.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPalette?.name === palette.name ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePaletteSelect(palette)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{palette.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {palette.description}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <ColorSwatch 
                          color={palette.colors.primary} 
                          name="primary" 
                          size="sm" 
                        />
                        <ColorSwatch 
                          color={palette.colors.secondary} 
                          name="secondary" 
                          size="sm" 
                        />
                        <ColorSwatch 
                          color={palette.colors.accent} 
                          name="accent" 
                          size="sm" 
                        />
                        <ColorSwatch 
                          color={palette.colors.background} 
                          name="background" 
                          size="sm" 
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaletteSelect(palette);
                        }}
                      >
                        Use This Palette
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-10 p-1 border-2"
                  />
                  <Input
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateFromPrimary}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>

              {generatedPalette && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Generated Palette</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on your primary color: {customPrimary}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <ColorSwatch 
                          color={generatedPalette.colors.primary} 
                          name="primary" 
                        />
                        <ColorSwatch 
                          color={generatedPalette.colors.secondary} 
                          name="secondary" 
                        />
                        <ColorSwatch 
                          color={generatedPalette.colors.accent} 
                          name="accent" 
                        />
                        <ColorSwatch 
                          color={generatedPalette.colors.background} 
                          name="background" 
                        />
                        <ColorSwatch 
                          color={generatedPalette.colors.surface} 
                          name="surface" 
                        />
                        <ColorSwatch 
                          color={generatedPalette.colors.border} 
                          name="border" 
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePaletteSelect(generatedPalette)}
                          className="flex-1"
                        >
                          Use Generated Palette
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleGenerateFromPrimary}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedPalette && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Selected Palette: {selectedPalette.name}</h4>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(selectedPalette.colors).map(([name, color]) => (
                <div key={name} className="text-center">
                  <button
                    onClick={() => copyColorToClipboard(color, name)}
                    className="w-full h-12 rounded border-2 border-white shadow-sm hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-1 capitalize">{name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
