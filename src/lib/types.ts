// TypeScript interfaces for DSVI CMS data models
// Based on the comprehensive brief specifications

export interface UserProfile {
  id: string; // Supabase user ID
  email?: string;
  name?: string;
  role: 'DSVI_ADMIN' | 'SCHOOL_ADMIN';
  school_id?: string; // if SCHOOL_ADMIN, links to School.id
  created_at?: string;
  updated_at?: string;
}

// Enhanced Theme Configuration Interfaces
export interface ThemeColors {
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
}

export interface ThemeTypography {
  fontFamily?: {
    primary?: string;
    secondary?: string;
    display?: string;
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
}

export interface ThemeLayout {
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
}

export interface ThemeNavigation {
  style?: 'default' | 'centered' | 'split' | 'minimal';
  background?: string;
  textColor?: string;
  borderColor?: string;
  height?: string;
  logoSize?: string;
  dropShadow?: boolean;
}

export interface ThemeComponents {
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
}

export interface ThemeHero {
  style?: 'default' | 'gradient' | 'image' | 'video';
  overlayOpacity?: number;
  overlayColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
}

export interface ThemeFooter {
  background?: string;
  textColor?: string;
  borderColor?: string;
  style?: 'simple' | 'columns' | 'centered';
}

export interface ComprehensiveThemeSettings {
  colors?: ThemeColors;
  typography?: ThemeTypography;
  layout?: ThemeLayout;
  navigation?: ThemeNavigation;
  components?: ThemeComponents;
  hero?: ThemeHero;
  footer?: ThemeFooter;
  // Legacy compatibility
  primaryColor?: string;
}

export interface School {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  admin_user_id?: string | null;
  theme_settings?: ComprehensiveThemeSettings | null;
  custom_css?: string | null;
  theme_version?: number;
  contact_info?: { 
    address?: string; 
    phone?: string; 
    email?: string; 
    mapEmbedUrl?: string; 
  } | null;
  // Subscription Management Fields
  package_type?: 'standard' | 'advanced';
  subscription_start?: string;
  subscription_end?: string;
  subscription_status?: 'active' | 'expiring' | 'inactive' | 'trial';
  last_reminder_sent?: string;
  payment_status?: 'paid' | 'pending' | 'overdue';
  auto_renewal?: boolean;
  subscription_notes?: string;
  settings?: {
    enable_donations?: boolean;
  } | null;
}

export interface PageContent {
  id: string;
  created_at: string;
  updated_at: string;
  school_id: string;
  page_slug: 'homepage' | 'about-us' | 'academics' | 'admissions' | 'faculty' | 'contact' | string;
  title: string;
  meta_description?: string | null;
  sections: ContentSection[];
}

export type SectionType = 'hero' | 'text' | 'textWithImage' | 'gallery' | 'facultyList' | 'contactForm' | 'highlights' | 'testimonials' | 'callToAction';

export interface ContentSection {
  id: string; // UUID, generated client-side when adding a new section
  type: SectionType;
  config: any; // Type-specific configuration
}
// Specific config types for each section type
export interface HeroSectionConfig { 
  title: string; 
  subtitle?: string; 
  ctaText?: string; 
  ctaLink?: string; 
  imageUrl: string; 
}

export interface TextSectionConfig { 
  heading?: string; 
  body: string; // body can be markdown
}

export interface TextWithImageSectionConfig { 
  heading?: string; 
  body: string; 
  imageUrl: string; 
  imagePosition: 'left' | 'right'; 
}

export interface GallerySectionConfig { 
  images: Array<{ url: string; alt: string }>; 
}

export interface FacultyMember { 
  name: string; 
  title: string; 
  bio?: string; 
  imageUrl?: string; 
}

export interface FacultyListSectionConfig { 
  facultyMembers: Array<FacultyMember>; 
}

export interface ContactFormSectionConfig {
  title?: string;
  description?: string;
}

export interface HighlightItem {
  icon: string; // Lucide icon name
  title: string;
  description: string;
  badge?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface HighlightsSectionConfig {
  title?: string;
  subtitle?: string;
  highlights: Array<HighlightItem>;
  ctaText?: string;
  ctaLink?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsSectionConfig {
  title?: string;
  subtitle?: string;
  testimonials: Array<Testimonial>;
}

export interface CallToActionSectionConfig {
  title: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
}

// Type guards for section configs
export const isHeroConfig = (config: any): config is HeroSectionConfig => {
  return config && typeof config.title === 'string' && typeof config.imageUrl === 'string';
};

export const isTextConfig = (config: any): config is TextSectionConfig => {
  return config && typeof config.body === 'string';
};

export const isTextWithImageConfig = (config: any): config is TextWithImageSectionConfig => {
  return config && typeof config.body === 'string' && typeof config.imageUrl === 'string';
};

export const isGalleryConfig = (config: any): config is GallerySectionConfig => {
  return config && Array.isArray(config.images);
};

export const isFacultyListConfig = (config: any): config is FacultyListSectionConfig => {
  return config && Array.isArray(config.facultyMembers);
};

export const isContactFormConfig = (config: any): config is ContactFormSectionConfig => {
  return config !== null && typeof config === 'object';
};

// Phase 1: Admin Assignment & Activity Types
export interface AdminSchoolAssignment {
  id: string;
  school_admin_id: string;
  school_id: string;
  assigned_by: string;
  permissions: {
    can_edit?: boolean;
    can_approve?: boolean;
    can_manage_content?: boolean;
  };
  created_at: string;
  updated_at: string;
  // Relations
  school?: School;
  school_admin?: UserProfile;
  assigned_by_user?: UserProfile;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  school_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Relations
  user?: UserProfile;
  school?: School;
}

export interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  expiringSchools: number;
  pendingRequests: number;
  recentActivity: ActivityLog[];
  subscriptionBreakdown: {
    standard: number;
    advanced: number;
  };
}

export interface SchoolWithAssignments extends School {
  assignments?: AdminSchoolAssignment[];
  assigned_admins?: UserProfile[];
}
