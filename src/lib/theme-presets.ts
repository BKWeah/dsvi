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
      },      typography: {
        fontFamily: {
          primary: 'Inter, system-ui, sans-serif',
          display: 'Inter, system-ui, sans-serif',
        },
      },
      navigation: {
        style: 'default',
        background: '#ffffff',
        textColor: '#0f172a',
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
      },
      typography: {
        fontFamily: {
          primary: 'Poppins, sans-serif',
          display: 'Poppins, sans-serif',
        },
      },
      navigation: {
        style: 'default',
        background: '#ffffff',
        textColor: '#065f46',
      },
    },
  },  {
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
      },
      typography: {
        fontFamily: {
          primary: 'Playfair Display, serif',
          display: 'Playfair Display, serif',
        },
      },
      navigation: {
        style: 'centered',
        background: '#ffffff',
        textColor: '#581c87',
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
      },
    },
  },
];