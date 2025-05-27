import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette } from 'lucide-react';
import { ThemePreset, themePresets } from '@/lib/theme-presets';
import { ComprehensiveThemeSettings } from '@/lib/types';

interface ThemePresetSelectorProps {
  currentTheme: ComprehensiveThemeSettings;
  onPresetSelect: (preset: ThemePreset) => void;
}

export const ThemePresetSelector: React.FC<ThemePresetSelectorProps> = ({
  currentTheme,
  onPresetSelect,
}) => {
  const isPresetActive = (preset: ThemePreset) => {
    return preset.theme.colors?.primary === currentTheme.colors?.primary;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Presets
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose from pre-designed themes or customize your own
        </p>
      </CardHeader>      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themePresets.map((preset) => (
            <div
              key={preset.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                isPresetActive(preset)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onPresetSelect(preset)}
            >
              {isPresetActive(preset) && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              )}
              
              {/* Color Preview */}
              <div className="flex gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.preview.primaryColor }}
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.preview.secondaryColor }}
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.preview.backgroundColor }}
                />
              </div>              
              {/* Theme Info */}
              <h3 className="font-semibold text-sm mb-1">{preset.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {preset.description}
              </p>
              
              {/* Apply Button */}
              <Button
                size="sm"
                variant={isPresetActive(preset) ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onPresetSelect(preset);
                }}
              >
                {isPresetActive(preset) ? 'Active' : 'Apply'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};