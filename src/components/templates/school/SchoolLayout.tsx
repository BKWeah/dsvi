import React from 'react';
import { cn } from '@/lib/utils';
import SchoolHeader from './components/SchoolHeader';
import SchoolFooter from './components/SchoolFooter';
import { School, ComprehensiveThemeSettings } from '@/lib/types';

interface SchoolLayoutProps {
  school: School;
  children: React.ReactNode;
  className?: string;
}

export default function SchoolLayout({ school, children, className }: SchoolLayoutProps) {
  const theme = school.theme_settings || {};
  
  // Generate CSS custom properties from theme settings
  const themeStyles = React.useMemo(() => {
    const styles: Record<string, string> = {};
    
    // Colors
    if (theme.colors?.primary) styles['--theme-primary'] = theme.colors.primary;
    if (theme.colors?.secondary) styles['--theme-secondary'] = theme.colors.secondary;
    if (theme.colors?.accent) styles['--theme-accent'] = theme.colors.accent;
    if (theme.colors?.background) styles['--theme-background'] = theme.colors.background;
    if (theme.colors?.surface) styles['--theme-surface'] = theme.colors.surface;
    if (theme.colors?.text?.primary) styles['--theme-text-primary'] = theme.colors.text.primary;
    if (theme.colors?.text?.secondary) styles['--theme-text-secondary'] = theme.colors.text.secondary;
    if (theme.colors?.text?.muted) styles['--theme-text-muted'] = theme.colors.text.muted;
    if (theme.colors?.border) styles['--theme-border'] = theme.colors.border;    
    // Typography
    if (theme.typography?.fontFamily?.primary) styles['--font-primary'] = theme.typography.fontFamily.primary;
    if (theme.typography?.fontFamily?.display) styles['--font-display'] = theme.typography.fontFamily.display;
    
    // Layout
    if (theme.layout?.containerMaxWidth) styles['--container-max-width'] = theme.layout.containerMaxWidth;
    if (theme.layout?.spacing?.base) styles['--spacing-base'] = theme.layout.spacing.base;
    
    // Navigation
    if (theme.navigation?.height) styles['--nav-height'] = theme.navigation.height;
    if (theme.navigation?.logoSize) styles['--nav-logo-size'] = theme.navigation.logoSize;
    
    return styles;
  }, [theme]);

  return (
    <div 
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        className
      )}
      style={themeStyles}
    >
      <SchoolHeader school={school} />
      <main className="flex-1">
        {children}
      </main>
      <SchoolFooter school={school} />
      
      {/* Custom CSS if provided */}
      {school.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: school.custom_css }} />
      )}
    </div>
  );
}
