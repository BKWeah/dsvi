import { School } from '@/lib/types';
import { defaultSchoolTheme } from './themeConfig';

// Sample school data for demonstration
export const sampleSchoolData: School = {
  id: 'sample-school-001',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  name: 'Excellence Academy',
  slug: 'excellence-academy',
  logo_url: '/api/placeholder/150/150',
  admin_user_id: 'admin-001',
  theme_settings: defaultSchoolTheme,
  custom_css: null,
  theme_version: 1,
  contact_info: {
    address: '123 Education Boulevard, Lagos, Nigeria',
    phone: '+234 803 123 4567',
    email: 'info@excellenceacademy.edu.ng',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.8!2d3.3517!3d6.5244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzEnNDQuMyJOIDPCsDIxJzA2LjIiRQ!5e0!3m2!1sen!2sng!4v1234567890'
  },
  package_type: 'standard',
  subscription_start: '2024-01-01',
  subscription_end: '2024-12-31',
  subscription_status: 'active',
  last_reminder_sent: null,
  payment_status: 'paid',
  auto_renewal: true,
  subscription_notes: 'Standard package - all features included'
};

// Sample page content for different pages
export const samplePageContent = {
  homepage: {
    id: 'page-home-001',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    school_id: 'sample-school-001',
    page_slug: 'homepage' as const,
    title: 'Welcome to Excellence Academy',
    meta_description: 'Excellence Academy - Providing quality education and character development for students in Lagos, Nigeria.',
    sections: []
  },
  about: {
    id: 'page-about-001',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    school_id: 'sample-school-001',
    page_slug: 'about-us' as const,
    title: 'About Excellence Academy',
    meta_description: 'Learn about our mission, vision, and commitment to educational excellence.',
    sections: []
  }
};