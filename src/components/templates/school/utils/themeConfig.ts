import { ComprehensiveThemeSettings } from '@/lib/types';

// Default DSVI theme settings for school websites
export const defaultSchoolTheme: ComprehensiveThemeSettings = {
  colors: {
    primary: '#2563eb', // Blue-600
    secondary: '#7c3aed', // Violet-600  
    accent: '#059669', // Emerald-600
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a', // Slate-900
      secondary: '#475569', // Slate-600
      muted: '#94a3b8' // Slate-400
    },
    border: '#e2e8f0', // Slate-200
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    error: '#ef4444' // Red-500
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  layout: {
    containerMaxWidth: '1200px',
    borderRadius: {
      sm: '0.25rem',
      base: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    breakpoints: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px'
    }
  },
  navigation: {
    style: 'default',
    background: '#ffffff',
    textColor: '#0f172a',
    borderColor: '#e2e8f0',
    height: '64px',
    logoSize: '40px',
    dropShadow: true
  },
  components: {
    cards: {
      background: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    buttons: {
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      padding: '0.5rem 1rem'
    },
    forms: {
      borderRadius: '0.375rem',
      borderColor: '#d1d5db',
      focusColor: '#2563eb'
    }
  },
  hero: {
    style: 'image',
    overlayOpacity: 0.4,
    overlayColor: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    minHeight: '600px'
  },
  footer: {
    background: '#0f172a',
    textColor: '#ffffff',
    borderColor: '#374151',
    style: 'columns'
  }
};

// Utility function to merge user theme with default theme
export const mergeThemes = (
  userTheme: Partial<ComprehensiveThemeSettings> = {}
): ComprehensiveThemeSettings => {
  return {
    ...defaultSchoolTheme,
    ...userTheme,
    colors: { ...defaultSchoolTheme.colors, ...userTheme.colors },
    typography: { ...defaultSchoolTheme.typography, ...userTheme.typography },
    layout: { ...defaultSchoolTheme.layout, ...userTheme.layout },
    navigation: { ...defaultSchoolTheme.navigation, ...userTheme.navigation },
    components: { ...defaultSchoolTheme.components, ...userTheme.components },
    hero: { ...defaultSchoolTheme.hero, ...userTheme.hero },
    footer: { ...defaultSchoolTheme.footer, ...userTheme.footer }
  };
};