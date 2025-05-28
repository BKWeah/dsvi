import { ComprehensiveThemeSettings } from '@/lib/types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: ComprehensiveThemeSettings;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Classic Blue',
    description: 'Professional and clean design with blue accents',
    preview: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
    },
    theme: {
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
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
        },
        fontWeight: {
          normal: 400,
          bold: 700,
        },
        lineHeight: {
          normal: 1.5,
          tight: 1.25,
        },
      },
      layout: {
        containerMaxWidth: '1200px',
        borderRadius: {
          base: '0.5rem',
          lg: '0.75rem',
        },
        spacing: {
          sm: '0.5rem',
          base: '1rem',
          lg: '1.5rem',
          xl: '2rem',
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
    },
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    description: 'Fresh and vibrant with green nature tones',
    preview: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      backgroundColor: '#f0fdf4',
    },
    theme: {
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#3b82f6',
        background: '#f0fdf4',
        surface: '#ffffff',
        text: {
          primary: '#065f46',
          secondary: '#047857',
          muted: '#6b7280',
        },
        border: '#d1fae5',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      typography: {
        fontFamily: {
          primary: 'Poppins, sans-serif',
          display: 'Poppins, sans-serif',
          secondary: 'Inter, system-ui, sans-serif',
        },
        fontSize: {
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
        },
        fontWeight: {
          normal: 400,
          bold: 600,
        },
        lineHeight: {
          normal: 1.6,
          tight: 1.3,
        },
      },
      layout: {
        containerMaxWidth: '1200px',
        borderRadius: {
          base: '0.75rem',
          lg: '1rem',
        },
        spacing: {
          sm: '0.75rem',
          base: '1.25rem',
          lg: '2rem',
          xl: '2.5rem',
        },
      },
      navigation: {
        style: 'default',
        background: '#ffffff',
        textColor: '#065f46',
        borderColor: '#d1fae5',
        height: '64px',
        logoSize: '40px',
        dropShadow: true,
      },
      components: {
        cards: {
          background: '#ffffff',
          borderColor: '#d1fae5',
          borderRadius: '0.75rem',
          shadow: 'md',
        },
        buttons: {
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          padding: '0.75rem 1.5rem',
        },
        forms: {
          borderRadius: '0.5rem',
          borderColor: '#d1fae5',
          focusColor: '#10b981',
        },
      },
      hero: {
        style: 'gradient',
        textAlign: 'center',
        minHeight: '500px',
        overlayOpacity: 0.2,
        overlayColor: '#065f46',
      },
      footer: {
        style: 'columns',
        background: '#065f46',
        textColor: '#ffffff',
        borderColor: '#047857',
      },
    },
  },
  {
    id: 'academic-purple',
    name: 'Academic Purple',
    description: 'Scholarly and elegant with purple accents',
    preview: {
      primaryColor: '#7c3aed',
      secondaryColor: '#a855f7',
      backgroundColor: '#faf7ff',
    },
    theme: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#f59e0b',
        background: '#faf7ff',
        surface: '#ffffff',
        text: {
          primary: '#581c87',
          secondary: '#7c2d92',
          muted: '#64748b',
        },
        border: '#e9d5ff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      typography: {
        fontFamily: {
          primary: 'Playfair Display, serif',
          display: 'Playfair Display, serif',
          secondary: 'Inter, system-ui, sans-serif',
        },
        fontSize: {
          base: '1.125rem',
          lg: '1.25rem',
          xl: '1.5rem',
          '2xl': '1.875rem',
        },
        fontWeight: {
          normal: 400,
          bold: 700,
        },
        lineHeight: {
          normal: 1.7,
          tight: 1.2,
        },
      },
      layout: {
        containerMaxWidth: '1200px',
        borderRadius: {
          base: '0.25rem',
          lg: '0.5rem',
        },
        spacing: {
          sm: '0.75rem',
          base: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
      },
      navigation: {
        style: 'centered',
        background: '#ffffff',
        textColor: '#581c87',
        borderColor: '#e9d5ff',
        height: '80px',
        logoSize: '48px',
        dropShadow: true,
      },
      components: {
        cards: {
          background: '#ffffff',
          borderColor: '#e9d5ff',
          borderRadius: '0.25rem',
          shadow: 'lg',
        },
        buttons: {
          borderRadius: '0.25rem',
          fontSize: '1rem',
          padding: '0.75rem 2rem',
        },
        forms: {
          borderRadius: '0.25rem',
          borderColor: '#e9d5ff',
          focusColor: '#7c3aed',
        },
      },
      hero: {
        style: 'image',
        textAlign: 'center',
        minHeight: '500px',
        overlayOpacity: 0.4,
        overlayColor: '#581c87',
      },
      footer: {
        style: 'centered',
        background: '#581c87',
        textColor: '#ffffff',
        borderColor: '#7c2d92',
      },
    },
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    description: 'Energetic and friendly with warm orange tones',
    preview: {
      primaryColor: '#ea580c',
      secondaryColor: '#f97316',
      backgroundColor: '#fff7ed',
    },
    theme: {
      colors: {
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#dc2626',
        background: '#fff7ed',
        surface: '#ffffff',
        text: {
          primary: '#9a3412',
          secondary: '#c2410c',
          muted: '#78716c',
        },
        border: '#fed7aa',
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
      },
      typography: {
        fontFamily: {
          primary: 'Montserrat, sans-serif',
          display: 'Montserrat, sans-serif',
          secondary: 'Open Sans, sans-serif',
        },
        fontSize: {
          base: '1rem',
          lg: '1.125rem',
          xl: '1.375rem',
          '2xl': '1.75rem',
        },
        fontWeight: {
          normal: 500,
          bold: 700,
        },
        lineHeight: {
          normal: 1.6,
          tight: 1.25,
        },
      },
      layout: {
        containerMaxWidth: '1400px',
        borderRadius: {
          base: '0.75rem',
          lg: '1rem',
        },
        spacing: {
          sm: '0.5rem',
          base: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
      },
      navigation: {
        style: 'split',
        background: '#ffffff',
        textColor: '#9a3412',
        borderColor: '#fed7aa',
        height: '72px',
        logoSize: '44px',
        dropShadow: true,
      },
      components: {
        cards: {
          background: '#ffffff',
          borderColor: '#fed7aa',
          borderRadius: '0.75rem',
          shadow: 'md',
        },
        buttons: {
          borderRadius: '9999px',
          fontSize: '0.9rem',
          padding: '0.625rem 1.25rem',
        },
        forms: {
          borderRadius: '0.5rem',
          borderColor: '#fed7aa',
          focusColor: '#ea580c',
        },
      },
      hero: {
        style: 'gradient',
        textAlign: 'left',
        minHeight: '450px',
        overlayOpacity: 0.3,
        overlayColor: '#9a3412',
      },
      footer: {
        style: 'simple',
        background: '#9a3412',
        textColor: '#ffffff',
        borderColor: '#c2410c',
      },
    },
  },
];