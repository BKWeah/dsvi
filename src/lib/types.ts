// TypeScript interfaces for DSVI CMS data models
// Based on the comprehensive brief specifications

export interface UserProfile {
  id: string; // Supabase user ID
  email?: string;
  name?: string;
  role: 'DSVI_ADMIN' | 'SCHOOL_ADMIN';
  school_id?: string; // if SCHOOL_ADMIN, links to School.id
}

export interface School {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  admin_user_id?: string | null;
  theme_settings?: { primaryColor?: string; [key: string]: any } | null;
  contact_info?: { 
    address?: string; 
    phone?: string; 
    email?: string; 
    mapEmbedUrl?: string; 
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

export type SectionType = 'hero' | 'text' | 'textWithImage' | 'gallery' | 'facultyList' | 'contactForm';

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