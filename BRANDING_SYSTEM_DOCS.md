# School Branding & Theme System Documentation

## Overview

The School Branding & Theme System provides a comprehensive solution for customizing the visual appearance of school websites. It includes advanced theming capabilities, real-time preview, and export/import functionality.

## Components

### 1. BrandingInterface

The main interface component that provides a complete branding customization experience.

**Location:** `src/components/ui/custom/BrandingInterface.tsx`

**Features:**
- Tabbed interface for settings and preview
- Real-time theme validation
- Export/import functionality
- Responsive preview modes
- Unsaved changes tracking

**Usage:**
```tsx
import { BrandingInterface } from '@/components/ui/custom/BrandingInterface';

<BrandingInterface
  schoolName="Your School Name"
  initialTheme={existingTheme}
  initialCustomCSS={existingCSS}
  initialLogoUrl={existingLogo}
  onThemeChange={(theme) => console.log('Theme changed:', theme)}
  onSave={(theme, css, logoUrl) => saveToDatabase(theme, css, logoUrl)}
/>
```

### 2. ComprehensiveBrandingTab

Advanced theming controls organized into tabs.

**Location:** `src/components/ui/custom/ComprehensiveBrandingTab.tsx`

**Tabs:**
- **Colors:** Brand colors, text colors, status colors, and palette generator
- **Typography:** Font families, sizes, weights, and line heights
- **Layout:** Container widths, spacing, border radius, and breakpoints
- **Navigation:** Navigation styles, heights, colors, and logo sizing
- **Components:** Card styles, button styles, and form styling
- **Hero:** Hero section styles, overlays, and layouts
- **Footer:** Footer layouts and styling
- **Advanced:** Custom CSS editor and theme import/export

### 3. ColorPaletteGenerator

Intelligent color palette generator and selector.

**Location:** `src/components/ui/custom/ColorPaletteGenerator.tsx`

**Features:**
- Pre-designed color palettes for different themes
- Custom palette generation from primary color
- Color harmony algorithms
- Click-to-copy color codes
- Visual color swatches

### 4. ThemePreview

Real-time preview component showing how the theme looks on a website.

**Location:** `src/components/ui/custom/ThemePreview.tsx`

**Features:**
- Full website preview with navigation, hero, content, and footer
- Responsive design simulation
- Live theme application
- Sample content representation

### 5. ThemePresetSelector

Quick theme preset selection with visual previews.

**Location:** `src/components/ui/custom/ThemePresetSelector.tsx`

**Features:**
- Pre-designed theme presets
- Visual theme previews
- One-click theme application
- Theme comparison

## Theme Structure

### ComprehensiveThemeSettings Interface

```typescript
interface ComprehensiveThemeSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: {
      primary?: string;
      secondary?: string;
      muted?: string;
    };
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  typography?: {
    fontFamily?: {
      primary?: string;
      display?: string;
      secondary?: string;
    };
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
    };
    fontWeight?: {
      light?: number;
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
    lineHeight?: {
      tight?: number;
      normal?: number;
      relaxed?: number;
    };
  };
  layout?: {
    containerMaxWidth?: string;
    borderRadius?: {
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
    };
    spacing?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
    };
    breakpoints?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
    };
  };
  navigation?: {
    style?: 'default' | 'centered' | 'split' | 'minimal';
    background?: string;
    textColor?: string;
    borderColor?: string;
    height?: string;
    logoSize?: string;
    dropShadow?: boolean;
  };
  components?: {
    cards?: {
      background?: string;
      borderColor?: string;
      borderRadius?: string;
      shadow?: string;
    };
    buttons?: {
      borderRadius?: string;
      fontSize?: string;
      padding?: string;
    };
    forms?: {
      borderRadius?: string;
      borderColor?: string;
      focusColor?: string;
    };
  };
  hero?: {
    style?: 'default' | 'gradient' | 'image' | 'video';
    overlayOpacity?: number;
    overlayColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    minHeight?: string;
  };
  footer?: {
    background?: string;
    textColor?: string;
    borderColor?: string;
    style?: 'simple' | 'columns' | 'centered';
  };
}
```

## Utility Functions

### Theme Utilities

**Location:** `src/lib/theme-utils.ts`

**Functions:**
- `generateThemeCSS(theme, customCSS)` - Generate CSS from theme settings
- `applyTheme(theme, customCSS)` - Apply theme to document
- `getThemeColor(theme, colorPath)` - Get specific theme color
- `getThemeClasses(theme)` - Generate theme-aware CSS classes
- `validateTheme(theme)` - Validate theme settings
- `exportTheme(theme)` - Export theme as JSON
- `importTheme(jsonString)` - Import theme from JSON

### Custom Hook

**Location:** `src/hooks/use-theme.ts`

**useTheme Hook:**
```typescript
const {
  theme,
  customCSS,
  setTheme,
  setCustomCSS,
  updateTheme,
  resetTheme,
  exportTheme,
  importTheme,
  applyTheme,
  validateTheme,
  isThemeValid,
} = useTheme({
  initialTheme,
  customCSS: initialCustomCSS,
  autoApply: true,
});
```

## CSS Variables

The system generates CSS variables that can be used in custom CSS:

### Color Variables
```css
--theme-primary
--theme-secondary
--theme-accent
--theme-background
--theme-surface
--theme-border
--theme-text-primary
--theme-text-secondary
--theme-text-muted
--theme-success
--theme-warning
--theme-error
```

### Typography Variables
```css
--font-primary
--font-display
--font-secondary
--font-size-xs
--font-size-sm
--font-size-base
--font-size-lg
--font-size-xl
--font-size-2xl
--font-size-3xl
--font-size-4xl
--font-weight-light
--font-weight-normal
--font-weight-medium
--font-weight-semibold
--font-weight-bold
--line-height-tight
--line-height-normal
--line-height-relaxed
```

### Layout Variables
```css
--container-max-width
--border-radius-sm
--border-radius-base
--border-radius-lg
--border-radius-xl
--spacing-xs
--spacing-sm
--spacing-base
--spacing-lg
--spacing-xl
--breakpoint-sm
--breakpoint-md
--breakpoint-lg
--breakpoint-xl
```

### Component Variables
```css
--nav-background
--nav-text-color
--nav-border-color
--nav-height
--nav-logo-size
--card-background
--card-border-color
--card-border-radius
--button-border-radius
--button-font-size
--button-padding
--form-border-radius
--form-border-color
--form-focus-color
--hero-min-height
--hero-text-align
--hero-overlay-color
--hero-overlay-opacity
--footer-background
--footer-text-color
--footer-border-color
```

## Usage Examples

### Basic Theme Setup

```tsx
import { BrandingInterface } from '@/components/ui/custom/BrandingInterface';
import { useTheme } from '@/hooks/use-theme';

function SchoolBrandingPage() {
  const handleSave = (theme, customCSS, logoUrl) => {
    // Save to database
    saveSchoolTheme(schoolId, {
      theme_settings: theme,
      custom_css: customCSS,
      logo_url: logoUrl,
    });
  };

  return (
    <BrandingInterface
      schoolName="Greenwood High School"
      onSave={handleSave}
    />
  );
}
```

### Custom Theme Implementation

```tsx
import { useTheme } from '@/hooks/use-theme';

function CustomThemeExample() {
  const { theme, updateTheme, applyTheme } = useTheme();

  const handleColorChange = (newPrimary) => {
    updateTheme({
      colors: {
        ...theme.colors,
        primary: newPrimary,
      }
    });
  };

  return (
    <div>
      <input 
        type="color" 
        onChange={(e) => handleColorChange(e.target.value)}
      />
    </div>
  );
}
```

### Using Theme in Components

```tsx
import { getThemeColor, getThemeClasses } from '@/lib/theme-utils';

function ThemedComponent({ theme }) {
  const primaryColor = getThemeColor(theme, 'colors.primary');
  const classes = getThemeClasses(theme);

  return (
    <div className={classes.card}>
      <button 
        className={classes.button}
        style={{ backgroundColor: primaryColor }}
      >
        Themed Button
      </button>
    </div>
  );
}
```

## Responsive Design

The theme system includes responsive breakpoints and mobile-optimized components:

- **Mobile (≤640px):** Simplified navigation, stacked layouts
- **Tablet (641px-1024px):** Balanced layout with medium spacing
- **Desktop (≥1025px):** Full layout with optimal spacing

## Theme Validation

The system includes built-in validation for:
- Required color fields
- Valid color format (hex codes)
- Font family specifications
- Numeric values for spacing and sizing
- Consistent theme structure

## Export/Import Features

### Export Options
- **Theme JSON:** Complete theme configuration
- **CSS Variables:** Generated CSS with variables
- **Full CSS:** Complete stylesheet with custom CSS

### Import Formats
- **Theme JSON:** Standard theme configuration
- **Partial Themes:** Merge with existing theme
- **Legacy Themes:** Automatic conversion from older formats

## Performance Considerations

- **CSS Generation:** Optimized CSS generation with minimal overhead
- **Real-time Preview:** Debounced updates to prevent excessive re-renders
- **Memory Management:** Proper cleanup of theme styles
- **Lazy Loading:** Components loaded only when needed

## Browser Support

- **Modern Browsers:** Full support for Chrome, Firefox, Safari, Edge
- **CSS Variables:** Native support in all modern browsers
- **Fallbacks:** Graceful degradation for older browsers
- **Mobile Browsers:** Optimized for mobile Safari and Chrome

## Integration Guide

### Database Schema

```sql
ALTER TABLE schools ADD COLUMN theme_settings JSONB;
ALTER TABLE schools ADD COLUMN custom_css TEXT;
ALTER TABLE schools ADD COLUMN theme_version INTEGER DEFAULT 1;
```

### API Endpoints

```typescript
// Save theme
PUT /api/schools/:id/theme
{
  theme_settings: ComprehensiveThemeSettings,
  custom_css: string,
  logo_url: string
}

// Get theme
GET /api/schools/:id/theme
```

### Environment Setup

Add to your main CSS file:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
```

## Troubleshooting

### Common Issues

1. **Theme not applying:** Check theme validation errors
2. **Colors not displaying:** Verify hex color format
3. **Fonts not loading:** Check font family spelling
4. **CSS conflicts:** Use CSS specificity or !important
5. **Preview not updating:** Check browser console for errors

### Debug Mode

Enable debug mode for additional logging:
```tsx
const { theme } = useTheme({ debug: true });
```

## Future Features

- **Dark Mode Support:** Automatic dark theme generation
- **Animation Presets:** Pre-defined animation themes
- **A11y Features:** Accessibility-focused theme options
- **Brand Guidelines:** Automatic brand guideline generation
- **Theme Marketplace:** Shareable theme library

## Support

For questions or issues:
1. Check the troubleshooting guide
2. Validate your theme settings
3. Check browser console for errors
4. Refer to component documentation
5. Contact support with theme export for debugging
