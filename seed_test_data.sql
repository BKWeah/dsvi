-- Seed data for testing the comprehensive theme system

-- Insert test school with enhanced theme settings
INSERT INTO schools (
  name, 
  slug, 
  logo_url,
  theme_settings,
  contact_info
) VALUES (
  'Greenwood Academy',
  'greenwood-academy',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&h=100&fit=crop&crop=center',
  '{
    "colors": {
      "primary": "#10b981",
      "secondary": "#059669", 
      "accent": "#3b82f6",
      "background": "#f0fdf4",
      "surface": "#ffffff",
      "text": {
        "primary": "#065f46",
        "secondary": "#047857", 
        "muted": "#6b7280"
      },
      "border": "#d1fae5"
    },
    "typography": {
      "fontFamily": {
        "primary": "Inter, system-ui, sans-serif",
        "display": "Poppins, sans-serif"
      }
    },
    "navigation": {
      "style": "default",
      "background": "#ffffff",
      "textColor": "#065f46"
    }
  }',
  '{
    "address": "123 Education Lane, Learning City, LC 12345",
    "phone": "(555) 123-4567",
    "email": "info@greenwoodacademy.edu"
  }'
),
(
  'Metropolitan High School', 
  'metropolitan-high',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop&crop=center',
  '{
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "accent": "#10b981", 
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": {
        "primary": "#0f172a",
        "secondary": "#475569",
        "muted": "#94a3b8"
      },
      "border": "#e2e8f0"
    }
  }',
  '{
    "address": "456 Scholar Drive, Metro City, MC 54321",
    "phone": "(555) 987-6543", 
    "email": "contact@metroHigh.edu"
  }'
);
-- Insert test pages with simple approach
DO $$
DECLARE
    school_1_id UUID;
    school_2_id UUID;
BEGIN
    -- Get school IDs
    SELECT id INTO school_1_id FROM schools WHERE slug = 'greenwood-academy';
    SELECT id INTO school_2_id FROM schools WHERE slug = 'metropolitan-high';
    
    -- Insert homepage for Greenwood Academy
    INSERT INTO pages (school_id, page_slug, title, meta_description, sections) VALUES (
        school_1_id,
        'homepage',
        'Welcome to Greenwood Academy',
        'Discover excellence in education at Greenwood Academy',
        '[
            {
                "id": "hero-section",
                "type": "hero",
                "config": {
                    "title": "Welcome to Greenwood Academy",
                    "subtitle": "Excellence in Education Since 1985",
                    "ctaText": "Learn More",
                    "ctaLink": "#about",
                    "imageUrl": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop&crop=center"
                }
            },
            {
                "id": "about-section",
                "type": "text",
                "config": {
                    "heading": "About Our School",
                    "body": "We are committed to providing quality education and fostering a supportive learning environment for all our students."
                }
            }
        ]'::jsonb
    );
    
    -- Insert homepage for Metropolitan High
    INSERT INTO pages (school_id, page_slug, title, meta_description, sections) VALUES (
        school_2_id,
        'homepage', 
        'Welcome to Metropolitan High School',
        'Discover excellence in education at Metropolitan High School',
        '[
            {
                "id": "hero-section",
                "type": "hero", 
                "config": {
                    "title": "Welcome to Metropolitan High School",
                    "subtitle": "Preparing Students for Tomorrow",
                    "ctaText": "Explore",
                    "ctaLink": "#explore",
                    "imageUrl": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=600&fit=crop&crop=center"
                }
            }
        ]'::jsonb
    );
END $$;