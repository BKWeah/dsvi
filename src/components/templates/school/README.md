# DSVI Standard School Website Template

A beautiful, responsive, and feature-rich school website template built with React, TypeScript, and ShadcnUI. This template follows the DSVI Standard School Website Template specifications and provides a complete solution for educational institutions.

## 🌟 Features

### **Complete Page Templates**
- **Homepage** - Hero section, highlights, testimonials, and call-to-action
- **About Us** - Mission, vision, values, leadership, and achievements
- **Academics** - Grade levels, curriculum, and special programs
- **Admissions** - Application process, requirements, and tuition
- **Faculty & Staff** - Team profiles and qualifications
- **Contact** - Contact form, information, and map integration

### **Modern Design**
- ✅ Fully responsive design (mobile-first)
- ✅ Beautiful ShadcnUI components
- ✅ Modern gradient backgrounds and hover effects
- ✅ Accessibility-compliant markup
- ✅ Dark theme support for footer
- ✅ Smooth animations and transitions

### **Customization Options**
- ✅ Theme-based styling with CSS custom properties
- ✅ Configurable colors, typography, and layout
- ✅ Custom CSS injection support
- ✅ Logo and branding integration
- ✅ Social media links

### **Performance Optimized**
- ✅ Lazy loading for images
- ✅ Optimized bundle size
- ✅ Fast rendering with React
- ✅ SEO-friendly structure

## 🚀 Quick Start

### Basic Usage

```tsx
import { DSVISchoolRenderer } from '@/components/templates/school';
import { sampleSchoolData } from '@/components/templates/school/utils/sampleData';

function App() {
  return (
    <DSVISchoolRenderer 
      school={sampleSchoolData}
      currentPage="home"
    />
  );
}
```

### Individual Page Components

```tsx
import { HomePage, AboutPage, SchoolLayout } from '@/components/templates/school';

// Use individual pages with custom layout
function CustomSchoolSite({ school }) {
  return (
    <SchoolLayout school={school}>
      <HomePage school={school} />
    </SchoolLayout>
  );
}
```
## 🎨 Theme Customization

### Using Default Theme
```tsx
import { defaultSchoolTheme } from '@/components/templates/school/utils/themeConfig';

const school = {
  ...schoolData,
  theme_settings: defaultSchoolTheme
};
```

### Custom Theme
```tsx
import { mergeThemes } from '@/components/templates/school/utils/themeConfig';

const customTheme = mergeThemes({
  colors: {
    primary: '#8b5cf6', // Custom purple
    secondary: '#06b6d4', // Custom cyan
  },
  typography: {
    fontFamily: {
      primary: 'Roboto, sans-serif'
    }
  }
});

const school = {
  ...schoolData,
  theme_settings: customTheme
};
```

## 📱 Page Structure

### Homepage
- **Hero Section** - School name, welcome message, CTA buttons
- **Highlights** - Key features and programs (STEM, awards, etc.)
- **Testimonials** - Parent and student testimonials
- **Call to Action** - Application encouragement

### About Us
- **Mission, Vision & Values** - Core institutional principles
- **School History** - Founding story and milestones
- **Leadership** - Principal, administrators, key staff
- **Achievements** - Awards, recognitions, performance data

### Academics
- **Grade Levels** - Nursery through Senior Secondary
- **Special Programs** - STEM, Arts, ICT, Global Studies
- **Philosophy** - Educational approach and standards

### Admissions
- **Application Process** - Step-by-step guide
- **Requirements** - Documents and eligibility by grade
- **Tuition & Fees** - Transparent pricing structure
- **Scholarships** - Financial assistance information

### Faculty & Staff
- **Team Profiles** - Photos, qualifications, experience
- **Departments** - Organized by subject areas
- **Contact Information** - Direct email access

### Contact
- **Contact Form** - Name, email, subject, message
- **Contact Information** - Address, phone, email, hours
- **Map Integration** - Embedded Google Maps
- **Social Media** - Facebook, Instagram, Twitter links
## 🛠️ Technical Implementation

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **ShadcnUI** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Consistent iconography

### Component Architecture
```
src/components/templates/school/
├── DSVISchoolRenderer.tsx       # Main renderer
├── SchoolLayout.tsx             # Layout wrapper
├── components/
│   ├── SchoolHeader.tsx         # Navigation header
│   └── SchoolFooter.tsx         # Footer with links
├── pages/
│   ├── HomePage.tsx             # Homepage
│   ├── AboutPage.tsx            # About us
│   ├── AcademicsPage.tsx        # Academic programs
│   ├── AdmissionsPage.tsx       # Admissions info
│   ├── FacultyPage.tsx          # Faculty profiles
│   └── ContactPage.tsx          # Contact form
├── sections/
│   ├── HeroSection.tsx          # Reusable hero
│   ├── HighlightsSection.tsx    # Program highlights
│   └── TestimonialsSection.tsx  # Testimonials
└── utils/
    ├── themeConfig.ts           # Theme settings
    └── sampleData.ts            # Demo data
```

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interface elements
- **Optimized** for all screen sizes

## 🎯 Built With Love by DSVI

This template represents the culmination of our commitment to providing exceptional educational technology solutions. Every component has been carefully crafted to meet the needs of modern educational institutions while maintaining simplicity for content management.

### Key Benefits
- **Time-saving** - Deploy beautiful school websites in minutes
- **Professional** - Modern design that builds trust
- **Accessible** - WCAG-compliant for all users
- **Scalable** - Easy to customize and extend
- **Maintainable** - Clean, documented codebase

---

**Built with ❤️ by DSVI** - Empowering education through technology.

For support and customization services, visit [dsvi.com](https://dsvi.com)
