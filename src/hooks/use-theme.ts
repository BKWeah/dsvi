import { useState, useEffect, useCallback } from 'react';
import { ComprehensiveThemeSettings } from '@/lib/types';
import { applyTheme, validateTheme, exportTheme, importTheme } from '@/lib/theme-utils';
import { useToast } from './use-toast';

interface UseThemeOptions {
  initialTheme?: ComprehensiveThemeSettings;
  autoApply?: boolean;
  customCSS?: string;
}

interface UseThemeReturn {
  theme: ComprehensiveThemeSettings;
  customCSS: string;
  setTheme: (theme: ComprehensiveThemeSettings) => void;
  setCustomCSS: (css: string) => void;
  updateTheme: (updates: Partial<ComprehensiveThemeSettings>) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (jsonString: string) => boolean;
  applyTheme: () => void;
  validateTheme: () => string[];
  isThemeValid: boolean;
}

const defaultTheme: ComprehensiveThemeSettings = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
    },
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
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
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  navigation: {
    style: 'default',
    background: '#ffffff',
    textColor: '#0f172a',
    borderColor: '#e2e8f0',
    height: '64px',
    logoSize: '40px',
    dropShadow: true,
  },
  components: {
    cards: {
      background: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      shadow: 'sm',
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
    textAlign: 'center',
    minHeight: '400px',
    overlayOpacity: 0.3,
    overlayColor: '#000000',
  },
  footer: {
    style: 'simple',
    background: '#1f2937',
    textColor: '#ffffff',
    borderColor: '#374151',
  },
};

export const useTheme = (options: UseThemeOptions = {}): UseThemeReturn => {
  const { initialTheme = defaultTheme, autoApply = true, customCSS: initialCustomCSS = '' } = options;
  const { toast } = useToast();
  
  const [theme, setThemeState] = useState<ComprehensiveThemeSettings>(initialTheme);
  const [customCSS, setCustomCSSState] = useState<string>(initialCustomCSS);
  const [isThemeValid, setIsThemeValid] = useState<boolean>(true);

  // Validate theme whenever it changes
  useEffect(() => {
    const errors = validateTheme(theme);
    setIsThemeValid(errors.length === 0);
    if (errors.length > 0) {
      console.warn('Theme validation errors:', errors);
    }
  }, [theme]);

  // Auto-apply theme when it changes
  useEffect(() => {
    if (autoApply && isThemeValid) {
      applyTheme(theme, customCSS);
    }
  }, [theme, customCSS, autoApply, isThemeValid]);

  const setTheme = useCallback((newTheme: ComprehensiveThemeSettings) => {
    setThemeState(newTheme);
  }, []);

  const setCustomCSS = useCallback((css: string) => {
    setCustomCSSState(css);
  }, []);

  const updateTheme = useCallback((updates: Partial<ComprehensiveThemeSettings>) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      ...updates,
      colors: {
        ...prevTheme.colors,
        ...updates.colors,
        text: {
          ...prevTheme.colors?.text,
          ...updates.colors?.text,
        },
      },
      typography: {
        ...prevTheme.typography,
        ...updates.typography,
        fontFamily: {
          ...prevTheme.typography?.fontFamily,
          ...updates.typography?.fontFamily,
        },
        fontSize: {
          ...prevTheme.typography?.fontSize,
          ...updates.typography?.fontSize,
        },
        fontWeight: {
          ...prevTheme.typography?.fontWeight,
          ...updates.typography?.fontWeight,
        },
        lineHeight: {
          ...prevTheme.typography?.lineHeight,
          ...updates.typography?.lineHeight,
        },
      },
      layout: {
        ...prevTheme.layout,
        ...updates.layout,
        borderRadius: {
          ...prevTheme.layout?.borderRadius,
          ...updates.layout?.borderRadius,
        },
        spacing: {
          ...prevTheme.layout?.spacing,
          ...updates.layout?.spacing,
        },
        breakpoints: {
          ...prevTheme.layout?.breakpoints,
          ...updates.layout?.breakpoints,
        },
      },
      navigation: {
        ...prevTheme.navigation,
        ...updates.navigation,
      },
      components: {
        ...prevTheme.components,
        ...updates.components,
        cards: {
          ...prevTheme.components?.cards,
          ...updates.components?.cards,
        },
        buttons: {
          ...prevTheme.components?.buttons,
          ...updates.components?.buttons,
        },
        forms: {
          ...prevTheme.components?.forms,
          ...updates.components?.forms,
        },
      },
      hero: {
        ...prevTheme.hero,
        ...updates.hero,
      },
      footer: {
        ...prevTheme.footer,
        ...updates.footer,
      },
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
    setCustomCSSState('');
    toast({
      title: 'Theme Reset',
      description: 'Theme has been reset to default settings',
    });
  }, [toast]);

  const exportThemeData = useCallback(() => {
    return exportTheme(theme);
  }, [theme]);

  const importThemeData = useCallback((jsonString: string) => {
    const importedTheme = importTheme(jsonString);
    if (importedTheme) {
      setThemeState(importedTheme);
      toast({
        title: 'Theme Imported',
        description: 'Theme has been imported successfully',
      });
      return true;
    } else {
      toast({
        title: 'Import Failed',
        description: 'Failed to import theme. Please check the JSON format.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const applyThemeManually = useCallback(() => {
    if (isThemeValid) {
      applyTheme(theme, customCSS);
      toast({
        title: 'Theme Applied',
        description: 'Theme has been applied to the page',
      });
    } else {
      toast({
        title: 'Cannot Apply Theme',
        description: 'Theme has validation errors. Please fix them first.',
        variant: 'destructive',
      });
    }
  }, [theme, customCSS, isThemeValid, toast]);

  const validateThemeData = useCallback(() => {
    return validateTheme(theme);
  }, [theme]);

  return {
    theme,
    customCSS,
    setTheme,
    setCustomCSS,
    updateTheme,
    resetTheme,
    exportTheme: exportThemeData,
    importTheme: importThemeData,
    applyTheme: applyThemeManually,
    validateTheme: validateThemeData,
    isThemeValid,
  };
};

export default useTheme;
