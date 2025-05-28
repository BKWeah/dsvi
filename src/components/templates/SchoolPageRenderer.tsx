import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { 
  School, 
  PageContent, 
  ContentSection, 
  HeroSectionConfig,
  TextSectionConfig,
  TextWithImageSectionConfig,
  GallerySectionConfig,
  FacultyListSectionConfig,
  ContactFormSectionConfig,
  isHeroConfig,
  isTextConfig,
  isTextWithImageConfig,
  isGalleryConfig,
  isFacultyListConfig,
  isContactFormConfig
} from '@/lib/types';

interface SchoolPageRendererProps {
  school: School;
  pageContent: PageContent;
}

const HeroSection: React.FC<{ config: HeroSectionConfig }> = ({ config }) => (
  <div 
    className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden"
    style={{ borderRadius: 'var(--theme-border-radius, 0.5rem)' }}
  >
    <img 
      src={config.imageUrl || '/placeholder-hero.jpg'} 
      alt={config.title}
      className="w-full h-full object-cover"
    />
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ 
        backgroundColor: `var(--theme-hero-overlay, rgba(0,0,0,0.4))`,
        textAlign: 'var(--theme-hero-text-align, center)' as any
      }}
    >
      <div className="text-center text-white px-4">
        <h1 
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ fontFamily: 'var(--theme-font-display, Inter, system-ui, sans-serif)' }}
        >
          {config.title}
        </h1>
        {config.subtitle && (
          <p 
            className="text-xl md:text-2xl mb-6"
            style={{ fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)' }}
          >
            {config.subtitle}
          </p>
        )}
        {config.ctaText && config.ctaLink && (
          <Button 
            asChild 
            size="lg" 
            style={{ 
              backgroundColor: 'var(--theme-primary, #3b82f6)',
              borderRadius: 'var(--theme-button-radius, 0.375rem)'
            }}
          >
            <a href={config.ctaLink}>{config.ctaText}</a>
          </Button>
        )}
      </div>
    </div>
  </div>
);

const TextSection: React.FC<{ config: TextSectionConfig }> = ({ config }) => (
  <Card 
    className="mb-8"
    style={{ 
      backgroundColor: 'var(--theme-surface, #ffffff)',
      borderColor: 'var(--theme-border, #e2e8f0)',
      borderRadius: 'var(--theme-border-radius, 0.5rem)'
    }}
  >
    <CardHeader>
      {config.heading && (
        <CardTitle 
          className="text-2xl"
          style={{ 
            color: 'var(--theme-text-primary, #0f172a)',
            fontFamily: 'var(--theme-font-display, Inter, system-ui, sans-serif)'
          }}
        >
          {config.heading}
        </CardTitle>
      )}
    </CardHeader>
    <CardContent>
      <div className="prose max-w-none">
        <div 
          className="whitespace-pre-wrap"
          style={{ 
            color: 'var(--theme-text-secondary, #475569)',
            fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
          }}
        >
          {config.body}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TextWithImageSection: React.FC<{ config: TextWithImageSectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardContent className="p-6">
      <div className={`grid md:grid-cols-2 gap-6 items-center ${
        config.imagePosition === 'right' ? '' : 'md:grid-cols-2'
      }`}>
        <div className={config.imagePosition === 'right' ? 'order-1' : 'order-2 md:order-1'}>
          {config.heading && <h2 className="text-2xl font-semibold mb-4">{config.heading}</h2>}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-foreground">{config.body}</div>
          </div>
        </div>
        <div className={config.imagePosition === 'right' ? 'order-2' : 'order-1 md:order-2'}>
          <img 
            src={config.imageUrl} 
            alt={config.heading || 'Section image'}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const GallerySection: React.FC<{ config: GallerySectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardContent className="p-6">
      {config.images && config.images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.images.map((image, index) => (
            <div key={index} className="aspect-square group relative overflow-hidden rounded-lg">
              <img 
                src={image.url} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-end">
                <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.title && (
                    <p className="font-medium text-sm">{image.title}</p>
                  )}
                  {image.description && (
                    <p className="text-xs">{image.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Gallery coming soon</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const FacultyListSection: React.FC<{ config: FacultyListSectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="text-2xl">Faculty & Staff</CardTitle>
    </CardHeader>
    <CardContent>
      {config.facultyMembers && config.facultyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.facultyMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.imageUrl} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">{member.title}</Badge>
                {member.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Faculty information coming soon</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const ContactFormSection: React.FC<{ config: ContactFormSectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="text-2xl">{config.title || 'Contact Us'}</CardTitle>
      {config.description && (
        <p className="text-muted-foreground">{config.description}</p>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Contact form will be available soon.</p>
        <p className="text-sm text-muted-foreground mt-2">
          For now, please use the contact information in the footer.
        </p>
      </div>
    </CardContent>
  </Card>
);

const renderSection = (section: ContentSection): React.ReactNode => {
  switch (section.type) {
    case 'hero':
      return isHeroConfig(section.config) ? 
        <HeroSection key={section.id} config={section.config} /> : null;
    case 'text':
      return isTextConfig(section.config) ? 
        <TextSection key={section.id} config={section.config} /> : null;
    case 'textWithImage':
      return isTextWithImageConfig(section.config) ? 
        <TextWithImageSection key={section.id} config={section.config} /> : null;
    case 'gallery':
      return isGalleryConfig(section.config) ? 
        <GallerySection key={section.id} config={section.config} /> : null;
    case 'facultyList':
      return isFacultyListConfig(section.config) ? 
        <FacultyListSection key={section.id} config={section.config} /> : null;
    case 'contactForm':
      return isContactFormConfig(section.config) ? 
        <ContactFormSection key={section.id} config={section.config} /> : null;
    default:
      return (
        <Card key={section.id} className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Unknown section type: {section.type}
            </p>
          </CardContent>
        </Card>
      );
  }
};

export default function SchoolPageRenderer({ school, pageContent }: SchoolPageRendererProps) {
  return (
    <div 
      className="container mx-auto p-4"
      style={{ 
        maxWidth: 'var(--theme-container-max-width, 1200px)',
        fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
      }}
    >
      {/* School Header */}
      <header className="mb-8 text-center">
        {school.logo_url && (
          <img 
            src={school.logo_url} 
            alt={`${school.name} Logo`} 
            className="mx-auto h-24 w-auto mb-4" 
          />
        )}
        <h1 
          className="text-4xl font-bold"
          style={{ 
            color: 'var(--theme-text-primary, #0f172a)',
            fontFamily: 'var(--theme-font-display, Inter, system-ui, sans-serif)'
          }}
        >
          {school.name}
        </h1>
        <p 
          className="text-xl"
          style={{ 
            color: 'var(--theme-text-secondary, #475569)',
            fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
          }}
        >
          {pageContent.title}
        </p>
      </header>

      {/* Dynamic Sections */}
      {pageContent.sections && pageContent.sections.length > 0 ? (
        pageContent.sections.map(renderSection)
      ) : (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">This page is under construction.</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Info & Footer */}
      {school.contact_info && (
        <Card 
          className="mb-8"
          style={{ 
            backgroundColor: 'var(--theme-surface, #ffffff)',
            borderColor: 'var(--theme-border, #e2e8f0)',
            borderRadius: 'var(--theme-border-radius, 0.5rem)'
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-2xl"
              style={{ 
                color: 'var(--theme-text-primary, #0f172a)',
                fontFamily: 'var(--theme-font-display, Inter, system-ui, sans-serif)'
              }}
            >
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {school.contact_info.address && (
              <div className="flex items-center space-x-2">
                <MapPin 
                  className="h-5 w-5"
                  style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
                />
                <span style={{ color: 'var(--theme-text-secondary, #475569)' }}>
                  {school.contact_info.address}
                </span>
              </div>
            )}
            {school.contact_info.phone && (
              <div className="flex items-center space-x-2">
                <Phone 
                  className="h-5 w-5"
                  style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
                />
                <span style={{ color: 'var(--theme-text-secondary, #475569)' }}>
                  {school.contact_info.phone}
                </span>
              </div>
            )}
            {school.contact_info.email && (
              <div className="flex items-center space-x-2">
                <Mail 
                  className="h-5 w-5"
                  style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
                />
                <a 
                  href={`mailto:${school.contact_info.email}`} 
                  className="hover:underline"
                  style={{ color: 'var(--theme-primary, #3b82f6)' }}
                >
                  {school.contact_info.email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      
    </div>
  );
}
