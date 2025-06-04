// DSVI Standard School Website Template
// Export all components for easy importing

export { default as DSVISchoolRenderer } from './DSVISchoolRenderer';
export { default } from './DSVISchoolRenderer'; // Also export as default
export { default as SchoolLayout } from './SchoolLayout';
export { default as DSVISchoolTemplateDemo } from './DSVISchoolTemplateDemo';

// Pages
export { default as HomePage } from './pages/HomePage';
export { default as AboutPage } from './pages/AboutPage';
export { default as AcademicsPage } from './pages/AcademicsPage';
export { default as AdmissionsPage } from './pages/AdmissionsPage';
export { default as FacultyPage } from './pages/FacultyPage';
export { default as ContactPage } from './pages/ContactPage';

// Components
export { default as SchoolHeader } from './components/SchoolHeader';
export { default as SchoolFooter } from './components/SchoolFooter';

// Sections
export { default as HeroSection } from './sections/HeroSection';
export { default as HighlightsSection } from './sections/HighlightsSection';
export { default as TestimonialsSection } from './sections/TestimonialsSection';

// Utils
export { defaultSchoolTheme, mergeThemes } from './utils/themeConfig';
export { sampleSchoolData, samplePageContent } from './utils/sampleData';

// Re-export types for convenience
export type { School, PageContent } from '@/lib/types';
