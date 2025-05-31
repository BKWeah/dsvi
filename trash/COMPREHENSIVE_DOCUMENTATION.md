# DSVI Platform - Comprehensive Documentation

## 🚀 Project Overview

The DSVI Platform is a comprehensive multi-school website platform with CMS capabilities built with modern web technologies. It enables DSVI administrators to manage multiple schools and allows school administrators to manage their own school's content through an intuitive interface.

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router DOM v6
- **State Management**: React Context API + React Query
- **Styling**: Tailwind CSS with CSS Variables

## 📋 Features Implemented

### ✅ Authentication & Authorization
- Secure login/signup with Supabase Auth
- Role-based access control (DSVI_ADMIN, SCHOOL_ADMIN)
- Protected routes with proper role validation
- User session management with context

### ✅ DSVI Admin Dashboard
- **Schools Management**: Add, edit, view all schools
- **School Requests**: Review and approve new school applications
- **User Management**: Create and assign school administrators
- **Content Oversight**: Access to all school content and pages
- **Settings Management**: Global platform settings

### ✅ School Admin CMS
- **Page Management**: Create and edit school pages (Homepage, About, etc.)
- **Content Sections**: Dynamic section-based content system
  - Hero sections with overlay controls
  - Text sections with rich formatting
  - Image galleries with upload management
  - Faculty listings with bio management
  - Contact forms and information
- **School Settings**: Logo, contact info, theme customization
- **Media Management**: File uploads via Supabase Storage

### ✅ Comprehensive Theme System
- **4 Professional Presets**: Classic Blue, Modern Green, Academic Purple, Warm Orange
- **Advanced Customization**:
  - Color system (primary, secondary, accent, backgrounds)
  - Typography control (3 font families, sizing, weights)
  - Layout options (spacing, borders, containers)
  - Navigation styles (4 variants with customization)
  - Component theming (cards, buttons, forms)
  - Hero section styles (4 variants with overlays)
- **Live Preview System**: Real-time theme preview with mini website mockup
- **Custom CSS Editor**: Advanced users can add custom styles
- **CSS Variables Integration**: Dynamic theme application

### ✅ Public School Websites
- **Dynamic Routing**: `/schools/:slug` for each school
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **SEO Optimized**: Dynamic meta tags and structured data
- **Theme Integration**: Automatic theme application from CMS
- **Performance Optimized**: Lazy loading and optimized assets

### ✅ Mobile Enhancements
- **Responsive Admin Interface**: Touch-friendly controls and layouts
- **Mobile Navigation**: Bottom app bar for mobile admin access
- **Optimized Forms**: Mobile-friendly form controls and validation
- **Touch Gestures**: Swipe and touch interactions where appropriate

### ✅ Enhanced UX Features
- **Floating Save Button**: Rainbow-animated save button with change tracking
- **Live Validation**: Real-time form validation with clear error messages
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Success/error feedback throughout the app
- **Breadcrumb Navigation**: Clear navigation hierarchy

## 🗃 Database Schema

### Schools Table
```sql
- id: UUID (Primary Key)
- name: TEXT (School name)
- slug: TEXT (URL-friendly identifier, unique)
- logo_url: TEXT (Supabase Storage URL)
- admin_user_id: UUID (FK to auth.users)
- contact_info: JSONB (address, phone, email, etc.)
- theme_settings: JSONB (comprehensive theme configuration)
- custom_css: TEXT (custom CSS overrides)
- theme_version: INTEGER (theme system version)
- created_at, updated_at: TIMESTAMP
```

### Pages Table
```sql
- id: UUID (Primary Key)
- school_id: UUID (FK to schools)
- page_slug: TEXT (homepage, about-us, etc.)
- title: TEXT (SEO title)
- meta_description: TEXT (SEO description)
- sections: JSONB (array of content sections)
- created_at, updated_at: TIMESTAMP
```

### School Requests Table
```sql
- id: UUID (Primary Key)
- school_name: TEXT
- contact_name, contact_email: TEXT
- phone, address, website: TEXT
- status: ENUM (pending, approved, rejected)
- reviewed_by: UUID (FK to auth.users)
- admin_notes: TEXT
- created_at, updated_at, reviewed_at: TIMESTAMP
```

## 🔐 Security Implementation

### Row Level Security (RLS)
- **Public Read Access**: All school and page data publicly readable
- **Admin Policies**: DSVI admins have full access to all data
- **School Admin Policies**: School admins can only access their assigned school
- **Storage Policies**: Authenticated users can upload, public read access

### Authentication Security
- **Role Validation**: Server-side role validation in RLS policies
- **Session Management**: Secure session handling with Supabase
- **Protected Routes**: Client-side route protection with role checks
- **API Security**: All database operations protected by RLS

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Mobile Optimizations
- **Touch Targets**: Minimum 44px touch targets
- **Navigation**: Bottom app bar for mobile admin access
- **Forms**: Optimized form controls and validation
- **Tables**: Card-based layouts on mobile
- **Modals**: Full-screen modals on mobile

## 🎨 Theme System Architecture

### CSS Variables System
- **Dynamic Variables**: Real-time CSS variable injection
- **Theme Inheritance**: Base theme with selective overrides
- **Component Integration**: All components use theme variables
- **Responsive Values**: Breakpoint-specific theme values

### Theme Configuration Structure
```typescript
interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    displayFont: string;
    secondaryFont: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
  layout: {
    containerMaxWidth: string;
    borderRadius: string;
    spacing: string;
  };
  navigation: {
    style: 'default' | 'centered' | 'split' | 'minimal';
    backgroundColor: string;
    textColor: string;
    logoSize: string;
    showShadow: boolean;
  };
  hero: {
    style: 'default' | 'gradient' | 'image' | 'video';
    overlayColor: string;
    overlayOpacity: number;
    textAlignment: 'left' | 'center' | 'right';
    minHeight: string;
  };
}
```

## 🚀 Deployment Architecture

### Static Site Generation
- **Build Process**: Vite builds optimized static assets
- **Dynamic Data**: Client-side data fetching from Supabase
- **CDN Deployment**: Deployable to Cloudflare Pages, Netlify, Vercel
- **Environment Variables**: Secure API key management

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Optimized image loading and caching
- **Bundle Optimization**: Tree shaking and minification
- **Lazy Loading**: Component and route lazy loading

## 📁 Project Structure

```
/dsvi-platform/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── custom/            # Custom composite components
│   │   ├── layouts/           # Application layouts
│   │   ├── mobile/            # Mobile-specific components
│   │   └── templates/         # Page rendering templates
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # External service integrations
│   ├── lib/                   # Utilities and types
│   ├── pages/                 # Route components
│   │   ├── dsvi-admin/        # DSVI admin panel pages
│   │   ├── school-admin/      # School admin CMS pages
│   │   └── public/            # Public school website pages
│   └── styles/                # Global styles and themes
└── supabase/                  # Supabase configuration
    ├── functions/             # Edge functions
    └── migrations/            # Database migrations
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- Bun or npm package manager
- Supabase account and project

### Environment Setup
```bash
# Clone repository
git clone [repository-url]
cd dsvi-platform

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and keys

# Run development server
bun dev
```

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] User authentication (login/logout/signup)
- [ ] Role-based access control
- [ ] School creation and management
- [ ] Page editing and content management
- [ ] Theme customization and preview
- [ ] File uploads and media management
- [ ] Public website rendering
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🐛 Troubleshooting

### Common Issues
1. **Authentication Issues**: Check Supabase RLS policies
2. **File Upload Failures**: Verify storage bucket policies
3. **Theme Not Applying**: Check CSS variable injection
4. **Mobile Layout Issues**: Verify responsive breakpoints
5. **Database Access Denied**: Confirm user role metadata

### Debug Tools
- Browser DevTools for client-side debugging
- Supabase Dashboard for database inspection
- Network tab for API call analysis
- React DevTools for component debugging

## 📈 Performance Metrics

### Target Performance
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Optimization Techniques
- Image lazy loading and optimization
- Route-based code splitting
- CSS and JavaScript minification
- CDN asset delivery
- Database query optimization

## 🔮 Future Enhancements

### Planned Features
- [ ] Advanced SEO tools and analytics
- [ ] Multi-language support
- [ ] Advanced page templates
- [ ] Bulk content management
- [ ] API for third-party integrations
- [ ] Advanced user permissions
- [ ] Content approval workflows
- [ ] Advanced theme marketplace

## 📞 Support & Maintenance

### Key Contacts
- Development Team: [contact-info]
- System Administration: [contact-info]
- User Support: [contact-info]

### Maintenance Schedule
- **Security Updates**: As needed
- **Feature Updates**: Monthly releases
- **Database Backups**: Daily automated
- **Performance Reviews**: Quarterly

---

*This documentation was last updated on May 28, 2025. For the most current information, please check the project repository.*
