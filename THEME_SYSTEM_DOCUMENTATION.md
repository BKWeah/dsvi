# DSVI Comprehensive Theme System Documentation

## Overview

The DSVI School CMS includes a comprehensive theming system that allows schools to completely customize the appearance of their public websites. This system provides granular control over colors, typography, layout, and advanced styling options.

## Features

### 1. **Theme Presets**
Pre-designed themes that can be applied instantly:
- **Classic Blue**: Professional and clean design with blue accents
- **Modern Green**: Fresh and vibrant with green nature tones
- **Academic Purple**: Scholarly and elegant with purple accents
- **Warm Orange**: Energetic and friendly with warm orange tones

### 2. **Color Customization**
Complete control over the color palette:
- Primary, secondary, and accent colors
- Background and surface colors
- Text colors (primary, secondary, muted)
- Border colors
- Status colors (success, warning, error)

### 3. **Typography Control**
Font family and styling options:
- Primary font for body text
- Display font for headings
- Font size scaling
- Font weight options
- Line height control

### 4. **Layout Settings**
Structural customization:
- Container max width
- Border radius styles
- Spacing scales
- Responsive breakpoints

### 5. **Navigation Customization**
Navigation bar styling:
- Style variants (default, centered, split, minimal)
- Background and text colors
- Logo sizing
- Drop shadow options

### 6. **Component Theming**
Individual component styling:
- Card appearance
- Button styles
- Form elements
- Input field styling

### 7. **Hero Section Options**
Landing page hero customization:
- Style variants (default, gradient, image, video)
- Overlay settings
- Text alignment
- Minimum height control

### 8. **Custom CSS Support**
Advanced customization with custom CSS:
- Full CSS override capability
- CSS variable integration
- Theme-aware custom styles

## Implementation Details

### Theme Context
The system uses React Context to manage theme state and provide theme utilities throughout the application.

### CSS Variables
Dynamic CSS variables are generated and applied to enable real-time theme updates:
```css
:root {
  --theme-primary: #3b82f6;
  --theme-secondary: #64748b;
  --theme-background: #ffffff;
  /* ... more variables */
}
```

### Database Storage
Theme settings are stored as JSONB in the database, allowing for flexible and extensible configuration storage.

## Usage Guide

### For School Administrators

1. **Access Theme Settings**
   - Navigate to School Settings > Branding tab
   - Choose from preset themes or customize manually

2. **Apply Preset Themes**
   - Select from the theme preset gallery
   - Preview changes in real-time
   - Apply with one click

3. **Custom Styling**
   - Use the color picker for brand colors
   - Select typography options
   - Adjust layout settings
   - Add custom CSS for advanced styling

4. **Preview Changes**
   - Use the live preview component
   - Open full preview in new tab
   - See changes in real-time

### For Developers

1. **Theme Variables**
   Use CSS variables in components:
   ```css
   .component {
     background-color: var(--theme-primary);
     color: var(--theme-text-primary);
     border-radius: var(--theme-border-radius);
   }
   ```

2. **Theme Context**
   Access theme in React components:
   ```typescript
   import { useTheme } from '@/contexts/ThemeContext';
   
   const MyComponent = () => {
     const { theme, applyTheme } = useTheme();
     // Use theme data
   };
   ```

3. **Extending Themes**
   Add new theme properties to the ComprehensiveThemeSettings interface:
   ```typescript
   interface ComprehensiveThemeSettings {
     // existing properties...
     newFeature?: {
       property1?: string;
       property2?: number;
     };
   }
   ```

## Best Practices

1. **Accessibility**: Ensure sufficient color contrast when customizing colors
2. **Performance**: Theme changes are applied via CSS variables for optimal performance
3. **Consistency**: Use theme variables consistently across all components
4. **Testing**: Preview changes across different devices and screen sizes
5. **Backup**: Consider exporting theme configurations before major changes

## Technical Architecture

### Components
- `ThemeContext`: Manages global theme state
- `ComprehensiveBrandingTab`: Main theme customization interface
- `ThemePresetSelector`: Preset theme selection
- `LiveThemePreview`: Real-time preview component

### Database Schema
- `theme_settings`: JSONB column for flexible theme storage
- `custom_css`: Text column for custom CSS overrides
- `theme_version`: Integer for tracking theme updates

### CSS Architecture
- `theme-variables.css`: Base CSS variables and utility classes
- Dynamic CSS variable injection via JavaScript
- Theme-aware component styling

This comprehensive theming system provides schools with the flexibility to create unique, branded websites while maintaining ease of use and performance.