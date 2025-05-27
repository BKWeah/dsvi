import React, { createContext, useContext, useEffect, useState } from 'react';
import { ComprehensiveThemeSettings, School } from '@/lib/types';

interface ThemeContextType {
  theme: ComprehensiveThemeSettings;
  setTheme: (theme: ComprehensiveThemeSettings) => void;
  applyTheme: (school: School) => void;
  resetTheme: () => void;
  generateCSSVariables: (theme: ComprehensiveThemeSettings) => string;
  isThemeLoaded: boolean;
}

const defaultTheme: ComprehensiveThemeSettings = {
  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#64748b', // slate-500
    accent: '#10b981', // emerald-500
    background: '#ffffff',
    surface: '#f8fafc', // slate-50
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#475569', // slate-600
      muted: '#94a3b8', // slate-400
    },
    border: '#e2e8f0', // slate-200
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
  },  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  layout: {
    containerMaxWidth: '1200px',
    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      base: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
  },  navigation: {
    style: 'default',
    background: '#ffffff',
    textColor: '#0f172a',
    borderColor: '#e2e8f0',
    height: '4rem',
    logoSize: '2rem',
    dropShadow: true,
  },
  components: {
    cards: {
      background: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
    buttons: {
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      padding: '0.5rem 1rem',
    },
    forms: {
      borderRadius: '0.375rem',
      borderColor: '#d1d5db',
      focusColor: '#3b82f6',
    },
  },
  hero: {
    style: 'default',
    overlayOpacity: 0.4,
    overlayColor: '#000000',
    textAlign: 'center',
    minHeight: '24rem',
  },
  footer: {
    background: '#f8fafc',
    textColor: '#475569',
    borderColor: '#e2e8f0',
    style: 'simple',
  },
};
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ComprehensiveThemeSettings>(defaultTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const applyTheme = (school: School) => {
    if (school.theme_settings) {
      const mergedTheme = mergeDeep(defaultTheme, school.theme_settings);
      setTheme(mergedTheme);
      applyCSSVariables(mergedTheme);
      
      // Apply custom CSS if provided
      if (school.custom_css) {
        applyCustomCSS(school.custom_css);
      }
    } else {
      setTheme(defaultTheme);
      applyCSSVariables(defaultTheme);
    }
    setIsThemeLoaded(true);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    applyCSSVariables(defaultTheme);
    removeCustomCSS();
    setIsThemeLoaded(true);
  };

  const generateCSSVariables = (themeSettings: ComprehensiveThemeSettings): string => {
    const cssVars: string[] = [];
    
    // Colors
    if (themeSettings.colors) {
      const colors = themeSettings.colors;
      if (colors.primary) cssVars.push(`--theme-primary: ${colors.primary}`);
      if (colors.secondary) cssVars.push(`--theme-secondary: ${colors.secondary}`);
      if (colors.accent) cssVars.push(`--theme-accent: ${colors.accent}`);
      if (colors.background) cssVars.push(`--theme-background: ${colors.background}`);
      if (colors.surface) cssVars.push(`--theme-surface: ${colors.surface}`);
      if (colors.border) cssVars.push(`--theme-border: ${colors.border}`);
      
      if (colors.text?.primary) cssVars.push(`--theme-text-primary: ${colors.text.primary}`);
      if (colors.text?.secondary) cssVars.push(`--theme-text-secondary: ${colors.text.secondary}`);
      if (colors.text?.muted) cssVars.push(`--theme-text-muted: ${colors.text.muted}`);
    }
    
    return cssVars.join('; ');
  };
  const applyCSSVariables = (themeSettings: ComprehensiveThemeSettings) => {
    const root = document.documentElement;
    
    // Apply color variables
    if (themeSettings.colors) {
      const colors = themeSettings.colors;
      if (colors.primary) root.style.setProperty('--theme-primary', colors.primary);
      if (colors.secondary) root.style.setProperty('--theme-secondary', colors.secondary);
      if (colors.accent) root.style.setProperty('--theme-accent', colors.accent);
      if (colors.background) root.style.setProperty('--theme-background', colors.background);
      if (colors.surface) root.style.setProperty('--theme-surface', colors.surface);
      if (colors.border) root.style.setProperty('--theme-border', colors.border);
      
      if (colors.text?.primary) root.style.setProperty('--theme-text-primary', colors.text.primary);
      if (colors.text?.secondary) root.style.setProperty('--theme-text-secondary', colors.text.secondary);
      if (colors.text?.muted) root.style.setProperty('--theme-text-muted', colors.text.muted);
    }

    // Apply typography variables
    if (themeSettings.typography) {
      const typography = themeSettings.typography;
      if (typography.fontFamily?.primary) {
        root.style.setProperty('--theme-font-primary', typography.fontFamily.primary);
      }
      if (typography.fontFamily?.display) {
        root.style.setProperty('--theme-font-display', typography.fontFamily.display);
      }
    }

    // Apply layout variables
    if (themeSettings.layout) {
      const layout = themeSettings.layout;
      if (layout.containerMaxWidth) {
        root.style.setProperty('--theme-container-max-width', layout.containerMaxWidth);
      }
      if (layout.borderRadius?.base) {
        root.style.setProperty('--theme-border-radius', layout.borderRadius.base);
      }
    }
  };

  const applyCustomCSS = (customCSS: string) => {
    const styleId = 'school-custom-css';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = customCSS;
  };

  const removeCustomCSS = () => {
    const styleElement = document.getElementById('school-custom-css');
    if (styleElement) {
      styleElement.remove();
    }
  };
  return (
    <ThemeContext.Provider 
      value={{
        theme,
        setTheme,
        applyTheme,
        resetTheme,
        generateCSSVariables,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Utility function to deep merge objects
function mergeDeep(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}