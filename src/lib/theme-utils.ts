import { ComprehensiveThemeSettings } from './types';

/**
 * Utility functions for theme management and CSS generation
 */

/**
 * Generate CSS variables from theme settings
 */
export function generateThemeCSS(theme: ComprehensiveThemeSettings, customCSS: string = ''): string {
  return `
/* Theme CSS Variables */
:root {
  /* Colors */
  --theme-primary: ${theme.colors?.primary || '#3b82f6'};
  --theme-secondary: ${theme.colors?.secondary || '#64748b'};
  --theme-accent: ${theme.colors?.accent || '#10b981'};
  --theme-background: ${theme.colors?.background || '#ffffff'};
  --theme-surface: ${theme.colors?.surface || '#f8fafc'};
  --theme-border: ${theme.colors?.border || '#e2e8f0'};
  --theme-text-primary: ${theme.colors?.text?.primary || '#0f172a'};
  --theme-text-secondary: ${theme.colors?.text?.secondary || '#475569'};
  --theme-text-muted: ${theme.colors?.text?.muted || '#94a3b8'};
  --theme-success: ${theme.colors?.success || '#10b981'};
  --theme-warning: ${theme.colors?.warning || '#f59e0b'};
  --theme-error: ${theme.colors?.error || '#ef4444'};
  
  /* Typography */
  --font-primary: ${theme.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif'};
  --font-display: ${theme.typography?.fontFamily?.display || 'Inter, system-ui, sans-serif'};
  --font-secondary: ${theme.typography?.fontFamily?.secondary || 'Inter, system-ui, sans-serif'};
  --font-size-xs: ${theme.typography?.fontSize?.xs || '0.75rem'};
  --font-size-sm: ${theme.typography?.fontSize?.sm || '0.875rem'};
  --font-size-base: ${theme.typography?.fontSize?.base || '1rem'};
  --font-size-lg: ${theme.typography?.fontSize?.lg || '1.125rem'};
  --font-size-xl: ${theme.typography?.fontSize?.xl || '1.25rem'};
  --font-size-2xl: ${theme.typography?.fontSize?.['2xl'] || '1.5rem'};
  --font-size-3xl: ${theme.typography?.fontSize?.['3xl'] || '1.875rem'};
  --font-size-4xl: ${theme.typography?.fontSize?.['4xl'] || '2.25rem'};
  --font-weight-light: ${theme.typography?.fontWeight?.light || 300};
  --font-weight-normal: ${theme.typography?.fontWeight?.normal || 400};
  --font-weight-medium: ${theme.typography?.fontWeight?.medium || 500};
  --font-weight-semibold: ${theme.typography?.fontWeight?.semibold || 600};
  --font-weight-bold: ${theme.typography?.fontWeight?.bold || 700};
  --line-height-tight: ${theme.typography?.lineHeight?.tight || 1.25};
  --line-height-normal: ${theme.typography?.lineHeight?.normal || 1.5};
  --line-height-relaxed: ${theme.typography?.lineHeight?.relaxed || 1.75};
  
  /* Layout */
  --container-max-width: ${theme.layout?.containerMaxWidth || '1200px'};
  --border-radius-sm: ${theme.layout?.borderRadius?.sm || '0.25rem'};
  --border-radius-base: ${theme.layout?.borderRadius?.base || '0.5rem'};
  --border-radius-lg: ${theme.layout?.borderRadius?.lg || '0.75rem'};
  --border-radius-xl: ${theme.layout?.borderRadius?.xl || '1rem'};
  --spacing-xs: ${theme.layout?.spacing?.xs || '0.25rem'};
  --spacing-sm: ${theme.layout?.spacing?.sm || '0.5rem'};
  --spacing-base: ${theme.layout?.spacing?.base || '1rem'};
  --spacing-lg: ${theme.layout?.spacing?.lg || '1.5rem'};
  --spacing-xl: ${theme.layout?.spacing?.xl || '2rem'};
  --breakpoint-sm: ${theme.layout?.breakpoints?.sm || '640px'};
  --breakpoint-md: ${theme.layout?.breakpoints?.md || '768px'};
  --breakpoint-lg: ${theme.layout?.breakpoints?.lg || '1024px'};
  --breakpoint-xl: ${theme.layout?.breakpoints?.xl || '1280px'};
  
  /* Navigation */
  --nav-background: ${theme.navigation?.background || '#ffffff'};
  --nav-text-color: ${theme.navigation?.textColor || '#000000'};
  --nav-border-color: ${theme.navigation?.borderColor || '#e5e7eb'};
  --nav-height: ${theme.navigation?.height || '64px'};
  --nav-logo-size: ${theme.navigation?.logoSize || '40px'};
  
  /* Components */
  --card-background: ${theme.components?.cards?.background || '#ffffff'};
  --card-border-color: ${theme.components?.cards?.borderColor || '#e5e7eb'};
  --card-border-radius: ${theme.components?.cards?.borderRadius || '0.5rem'};
  --button-border-radius: ${theme.components?.buttons?.borderRadius || '0.375rem'};
  --button-font-size: ${theme.components?.buttons?.fontSize || '0.875rem'};
  --button-padding: ${theme.components?.buttons?.padding || '0.5rem 1rem'};
  --form-border-radius: ${theme.components?.forms?.borderRadius || '0.375rem'};
  --form-border-color: ${theme.components?.forms?.borderColor || '#d1d5db'};
  --form-focus-color: ${theme.components?.forms?.focusColor || '#3b82f6'};
  
  /* Hero */
  --hero-min-height: ${theme.hero?.minHeight || '400px'};
  --hero-text-align: ${theme.hero?.textAlign || 'center'};
  --hero-overlay-color: ${theme.hero?.overlayColor || '#000000'};
  --hero-overlay-opacity: ${theme.hero?.overlayOpacity || 0.3};
  
  /* Footer */
  --footer-background: ${theme.footer?.background || '#1f2937'};
  --footer-text-color: ${theme.footer?.textColor || '#ffffff'};
  --footer-border-color: ${theme.footer?.borderColor || '#374151'};
}

/* Base Styles */
body {
  font-family: var(--font-primary);
  background-color: var(--theme-background);
  color: var(--theme-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-base);
}

/* Navigation Styles */
.navigation {
  background-color: var(--nav-background);
  color: var(--nav-text-color);
  height: var(--nav-height);
  border-bottom: 1px solid var(--nav-border-color);
  ${theme.navigation?.dropShadow !== false ? 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);' : ''}
}

.navigation .logo {
  height: var(--nav-logo-size);
}

.navigation.style-centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigation.style-split .logo {
  flex: 1;
}

.navigation.style-split .menu {
  flex: 1;
  text-align: right;
}

.navigation.style-minimal {
  box-shadow: none;
  border-bottom: none;
}

/* Component Styles */
.card {
  background-color: var(--card-background);
  border: 1px solid var(--card-border-color);
  border-radius: var(--card-border-radius);
  padding: var(--spacing-base);
}

.card.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.button {
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  padding: var(--button-padding);
  background-color: var(--theme-primary);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button.secondary {
  background-color: var(--theme-secondary);
}

.button.accent {
  background-color: var(--theme-accent);
}

/* Form Styles */
input, textarea, select {
  border-radius: var(--form-border-radius);
  border: 1px solid var(--form-border-color);
  padding: var(--spacing-sm);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  background-color: var(--theme-background);
  color: var(--theme-text-primary);
}

input:focus, textarea:focus, select:focus {
  outline: 2px solid var(--form-focus-color);
  outline-offset: -2px;
  border-color: var(--form-focus-color);
}

/* Hero Section */
.hero {
  min-height: var(--hero-min-height);
  text-align: var(--hero-text-align);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero.style-gradient {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
}

.hero.style-image {
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  background-color: var(--hero-overlay-color);
  opacity: var(--hero-overlay-opacity);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-content {
  position: relative;
  z-index: 10;
  color: white;
  padding: var(--spacing-xl);
}

/* Footer */
.footer {
  background-color: var(--footer-background);
  color: var(--footer-text-color);
  border-top: 1px solid var(--footer-border-color);
  padding: var(--spacing-xl) 0;
}

.footer.style-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.footer.style-centered {
  text-align: center;
}

/* Responsive Design */
@media (max-width: ${theme.layout?.breakpoints?.lg || '1024px'}) {
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .navigation {
    height: calc(var(--nav-height) * 0.8);
  }
  
  .hero {
    min-height: calc(var(--hero-min-height) * 0.8);
  }
}

@media (max-width: ${theme.layout?.breakpoints?.md || '768px'}) {
  :root {
    --font-size-base: ${parseFloat(theme.typography?.fontSize?.base || '1') * 0.9}rem;
    --spacing-base: ${parseFloat(theme.layout?.spacing?.base || '1') * 0.8}rem;
  }
  
  .hero {
    text-align: center;
  }
  
  .footer.style-columns {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: ${theme.layout?.breakpoints?.sm || '640px'}) {
  .navigation.style-split {
    flex-direction: column;
    height: auto;
    padding: var(--spacing-sm) 0;
  }
  
  .navigation.style-split .menu {
    text-align: center;
    margin-top: var(--spacing-sm);
  }
}

/* Custom CSS */
${customCSS}
  `.trim();
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: ComprehensiveThemeSettings, customCSS: string = '') {
  const css = generateThemeCSS(theme, customCSS);
  
  // Remove existing theme styles
  const existingStyle = document.getElementById('theme-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add new theme styles
  const style = document.createElement('style');
  style.id = 'theme-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Get theme color for use in components
 */
export function getThemeColor(theme: ComprehensiveThemeSettings, colorPath: string): string {
  const pathParts = colorPath.split('.');
  let current = theme as any;
  
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return '#000000'; // fallback color
    }
  }
  
  return typeof current === 'string' ? current : '#000000';
}

/**
 * Generate theme-aware CSS class names
 */
export function getThemeClasses(theme: ComprehensiveThemeSettings) {
  return {
    navigation: `navigation style-${theme.navigation?.style || 'default'}`,
    hero: `hero style-${theme.hero?.style || 'default'}`,
    footer: `footer style-${theme.footer?.style || 'simple'}`,
    card: `card shadow-${theme.components?.cards?.shadow || 'sm'}`,
    button: 'button',
    buttonSecondary: 'button secondary',
    buttonAccent: 'button accent',
  };
}

/**
 * Validate theme settings
 */
export function validateTheme(theme: ComprehensiveThemeSettings): string[] {
  const errors: string[] = [];
  
  // Check required colors
  if (!theme.colors?.primary) {
    errors.push('Primary color is required');
  }
  
  if (!theme.colors?.background) {
    errors.push('Background color is required');
  }
  
  // Validate color format
  const colorRegex = /^#[0-9A-F]{6}$/i;
  const colors = [
    theme.colors?.primary,
    theme.colors?.secondary,
    theme.colors?.accent,
    theme.colors?.background,
  ];
  
  colors.forEach((color, index) => {
    if (color && !colorRegex.test(color)) {
      errors.push(`Invalid color format: ${color}`);
    }
  });
  
  return errors;
}

/**
 * Export theme as JSON
 */
export function exportTheme(theme: ComprehensiveThemeSettings): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import theme from JSON
 */
export function importTheme(jsonString: string): ComprehensiveThemeSettings | null {
  try {
    const parsed = JSON.parse(jsonString);
    const errors = validateTheme(parsed);
    
    if (errors.length > 0) {
      console.warn('Theme validation warnings:', errors);
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to import theme:', error);
    return null;
  }
}
