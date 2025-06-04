import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { ComprehensiveThemeSettings, School } from '@/lib/types';
import { generateSchoolHomepageUrl } from '@/lib/subdomain-utils';

interface LiveThemePreviewProps {
  school: School;
  themeSettings: ComprehensiveThemeSettings;
  customCSS?: string;
}

export const LiveThemePreview: React.FC<LiveThemePreviewProps> = ({
  school,
  themeSettings,
  customCSS,
}) => {
  const generatePreviewStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (themeSettings.colors) {
      styles['--preview-primary'] = themeSettings.colors.primary;
      styles['--preview-secondary'] = themeSettings.colors.secondary;
      styles['--preview-background'] = themeSettings.colors.background;
      styles['--preview-surface'] = themeSettings.colors.surface;
      styles['--preview-text-primary'] = themeSettings.colors.text?.primary;
      styles['--preview-text-secondary'] = themeSettings.colors.text?.secondary;
      styles['--preview-border'] = themeSettings.colors.border;
    }
    
    if (themeSettings.typography?.fontFamily) {
      styles['--preview-font-primary'] = themeSettings.typography.fontFamily.primary;
      styles['--preview-font-display'] = themeSettings.typography.fontFamily.display;
    }
    
    return styles;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Live Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how your theme changes will look on the public website
        </p>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
          style={generatePreviewStyles()}
        >
          {/* Mini Website Preview */}
          <div 
            className="bg-white rounded-lg shadow-sm overflow-hidden"
            style={{ backgroundColor: 'var(--preview-background, #ffffff)' }}
          >
            {/* Header Preview */}
            <div 
              className="h-12 flex items-center justify-between px-4 border-b"
              style={{ 
                backgroundColor: 'var(--preview-surface, #f8fafc)',
                borderColor: 'var(--preview-border, #e2e8f0)',
                fontFamily: 'var(--preview-font-primary, Inter, sans-serif)'
              }}
            >
              <div className="flex items-center gap-2">
                {school.logo_url && (
                  <img src={school.logo_url} alt="Logo" className="h-6 w-6" />
                )}
                <span 
                  className="font-bold text-sm"
                  style={{ 
                    color: 'var(--preview-text-primary, #0f172a)',
                    fontFamily: 'var(--preview-font-display, Inter, sans-serif)'
                  }}
                >
                  {school.name}
                </span>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: 'var(--preview-primary, #3b82f6)' }}
                />
                <div 
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: 'var(--preview-secondary, #64748b)' }}
                />
              </div>
            </div>            
            {/* Content Preview */}
            <div className="p-4 space-y-3">
              <div 
                className="h-4 rounded"
                style={{ backgroundColor: 'var(--preview-primary, #3b82f6)' }}
              />
              <div 
                className="h-2 rounded w-3/4"
                style={{ backgroundColor: 'var(--preview-text-secondary, #475569)' }}
              />
              <div 
                className="h-2 rounded w-1/2"
                style={{ backgroundColor: 'var(--preview-text-secondary, #475569)' }}
              />
              
              <div 
                className="mt-4 p-3 rounded border"
                style={{ 
                  backgroundColor: 'var(--preview-surface, #f8fafc)',
                  borderColor: 'var(--preview-border, #e2e8f0)'
                }}
              >
                <div 
                  className="h-3 rounded w-2/3 mb-2"
                  style={{ backgroundColor: 'var(--preview-text-primary, #0f172a)' }}
                />
                <div 
                  className="h-2 rounded w-full"
                  style={{ backgroundColor: 'var(--preview-text-secondary, #475569)' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Button
            onClick={() => window.open(generateSchoolHomepageUrl(school.slug), '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};