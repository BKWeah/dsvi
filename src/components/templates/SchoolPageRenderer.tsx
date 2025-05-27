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
  <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
    <img 
      src={config.imageUrl || '/placeholder-hero.jpg'} 
      alt={config.title}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{config.title}</h1>
        {config.subtitle && (
          <p className="text-xl md:text-2xl mb-6">{config.subtitle}</p>
        )}
        {config.ctaText && config.ctaLink && (
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href={config.ctaLink}>{config.ctaText}</a>
          </Button>
        )}
      </div>
    </div>
  </div>
);

const TextSection: React.FC<{ config: TextSectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardHeader>
      {config.heading && <CardTitle className="text-2xl">{config.heading}</CardTitle>}
    </CardHeader>
    <CardContent>
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-foreground">{config.body}</div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.images.map((image, index) => (
          <div key={index} className="aspect-square">
            <img 
              src={image.url} 
              alt={image.alt}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const FacultyListSection: React.FC<{ config: FacultyListSectionConfig }> = ({ config }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="text-2xl">Faculty & Staff</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.facultyMembers.map((member, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={member.imageUrl} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <Badge variant="secondary" className="mb-2">{member.title}</Badge>
              {member.bio && (
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
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
    <div className="container mx-auto p-4">
      {/* School Header */}
      <header className="mb-8 text-center">
        {school.logo_url && (
          <img 
            src={school.logo_url} 
            alt={`${school.name} Logo`} 
            className="mx-auto h-24 w-auto mb-4" 
          />
        )}
        <h1 className="text-4xl font-bold">{school.name}</h1>
        <p className="text-xl text-muted-foreground">{pageContent.title}</p>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {school.contact_info.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{school.contact_info.address}</span>
              </div>
            )}
            {school.contact_info.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{school.contact_info.phone}</span>
              </div>
            )}
            {school.contact_info.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={`mailto:${school.contact_info.email}`} 
                  className="text-primary hover:underline"
                >
                  {school.contact_info.email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
        <p>© {new Date().getFullYear()} {school.name}. Powered by DSVI.</p>
      </footer>
    </div>
  );
}
