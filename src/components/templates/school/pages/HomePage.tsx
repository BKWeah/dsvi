import React from 'react';
import { School, PageContent } from '@/lib/types';
import HeroSection from '../sections/HeroSection';
import HighlightsSection from '../sections/HighlightsSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  school: School;
  pageContent?: PageContent;
}

export default function HomePage({ school, pageContent }: HomePageProps) {
  // Find hero section from pageContent or use defaults
  const heroSection = pageContent?.sections?.find(section => section.type === 'hero');
  const heroConfig = heroSection?.config || {};

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-12" />
      </header>

      {/* Hero Section */}
      <HeroSection
        title={heroConfig.title || `Welcome to ${school.name}`}
        subtitle={heroConfig.subtitle || "Empowering students to reach their full potential through quality education and character development"}
        backgroundImage={heroConfig.imageUrl || "/api/placeholder/1920/1080"}
        ctaButtons={[
          { text: heroConfig.ctaText || "Learn More", href: heroConfig.ctaLink || "/about", variant: "default" as const },
          { text: "Apply Now", href: "/admissions", variant: "default" as const },
          ...(school.settings?.enable_donations ? [{ text: "Donate", href: "/donate", variant: "secondary" as const }] : [])
        ]}
      />
      
      {/* Highlights Section */}
      <HighlightsSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Our School?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Take the first step towards an excellent education. Apply today and become part of our thriving academic community.
          </p>          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Schedule a Visit
            </Button>
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg border-white hover:text-primary">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 flex justify-start items-center">
          <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-12" />
        </div>
      </footer>
    </div>
  );
}
