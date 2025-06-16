import React from 'react';
import { School, PageContent, ContentSection } from '@/lib/types';
import HeroSection from '../sections/HeroSection';
import HighlightsSection from '../sections/HighlightsSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';

interface HomePageProps {
  school: School;
  pageContent?: PageContent;
}

// Helper function to render dynamic sections
const renderSection = (section: ContentSection, school: School) => {
  const { type, config } = section;
  
  switch (type) {
    case 'hero':
      return (
        <HeroSection
          key={section.id}
          title={config.title || `Welcome to ${school.name}`}
          subtitle={config.subtitle || "Empowering students to reach their full potential through quality education and character development"}
          backgroundImage={config.imageUrl || "/api/placeholder/1920/1080"}
          ctaButtons={[
            { text: config.ctaText || "Learn More", href: config.ctaLink || "/about", variant: "default" as const },
            { text: "Apply Now", href: "/admissions", variant: "default" as const },
            ...(school.settings?.enable_donations ? [{ text: "Donate", href: "/donate", variant: "secondary" as const }] : [])
          ]}
        />
      );
      
    case 'highlights':
      // Convert icon names to actual Lucide icons
      const highlightsWithIcons = config.highlights?.map((highlight: any) => ({
        ...highlight,
        icon: React.createElement((LucideIcons as any)[highlight.icon] || LucideIcons.Star, { className: "h-8 w-8" })
      })) || [];
      
      return (
        <HighlightsSection
          key={section.id}
          title={config.title}
          subtitle={config.subtitle}
          highlights={highlightsWithIcons}
        />
      );
      
    case 'testimonials':
      return (
        <TestimonialsSection
          key={section.id}
          title={config.title}
          subtitle={config.subtitle}
          testimonials={config.testimonials}
        />
      );
      
    case 'callToAction':
      return (
        <section key={section.id} className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {config.title || "Ready to Join Our School?"}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
              {config.subtitle || "Take the first step towards an excellent education. Apply today and become part of our thriving academic community."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {config.primaryButtonText && (
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" asChild>
                  <a href={config.primaryButtonLink || '#'}>{config.primaryButtonText}</a>
                </Button>
              )}
              {config.secondaryButtonText && (
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg border-white hover:text-primary" asChild>
                  <a href={config.secondaryButtonLink || '#'}>{config.secondaryButtonText}</a>
                </Button>
              )}
            </div>
          </div>
        </section>
      );
      
    default:
      return null;
  }
};

export default function HomePage({ school, pageContent }: HomePageProps) {
  // If we have pageContent sections, render them dynamically
  if (pageContent?.sections && pageContent.sections.length > 0) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-4 z-10">
          <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-12" />
        </header>

        {/* Dynamic Sections */}
        {pageContent.sections.map(section => renderSection(section, school))}

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          {/* Main Footer Content */}
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              {/* School Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  {school.logo_url && (
                    <img 
                      src={school.logo_url} 
                      alt={`${school.name} Logo`} 
                      className="h-10 w-auto brightness-0 invert"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white leading-tight">{school.name}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Empowering students to reach their full potential through quality education and character development.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white">Quick Links</h4>
                <ul className="space-y-3">
                  <li><a href="/" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Home</a></li>
                  <li><a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">About Us</a></li>
                  <li><a href="/academics" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Academics</a></li>
                  <li><a href="/admissions" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Admissions</a></li>
                  <li><a href="/faculty" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Faculty</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Contact</a></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-300 text-sm">123 Education Street, Academic City</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-300 text-sm">info@testschool.edu</span>
                  </div>
                </div>
              </div>

              {/* Social & Actions */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white">Connect With Us</h4>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </button>
                    <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.342-.09.375-.294 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.69-2.436-2.878-2.436-4.633 0-3.777 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.295-.744 2.86-.269 1.031-1.002 2.323-1.492 3.106C9.635 23.564 10.794 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                    </button>
                    <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.065 0C18.595 0 24 5.405 24 11.935c0 6.531-5.405 11.935-11.935 11.935S.131 18.466.131 11.935C.131 5.405 5.536.001 12.065.001zm2.31 18.477v-6.12H16.4v-1.469h-2.026V9.505c0-.625.325-.959.893-.959h1.136V7.047h-1.668c-1.533 0-2.36.896-2.36 2.375v1.465h-1.399v1.469h1.399v6.12h1.931z"/>
                      </svg>
                    </button>
                  </div>
                  <a 
                    href="/apply" 
                    className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline inline-flex items-center"
                  >
                    Apply Now →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 bg-gray-950">
            <div className="container mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                  <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
                  <div className="flex space-x-4">
                    <a href="/terms" className="hover:text-white transition-colors no-underline hover:underline">Terms of Use</a>
                    <a href="/privacy" className="hover:text-white transition-colors no-underline hover:underline">Privacy Policy</a>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Built with ❤️ by</span>
                  <a 
                    href="https://libdsvi.com" 
                    className="text-gray-300 hover:text-white transition-colors font-medium no-underline hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DSVI
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Fallback to default static layout if no pageContent
  const heroConfig = {};
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-12" />
      </header>

      {/* Hero Section */}
      <HeroSection
        title={`Welcome to ${school.name}`}
        subtitle="Empowering students to reach their full potential through quality education and character development"
        backgroundImage="/api/placeholder/1920/1080"
        ctaButtons={[
          { text: "Learn More", href: "/about", variant: "default" as const },
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
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* School Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                {school.logo_url && (
                  <img 
                    src={school.logo_url} 
                    alt={`${school.name} Logo`} 
                    className="h-10 w-auto brightness-0 invert"
                  />
                )}
                <h3 className="text-xl font-bold text-white leading-tight">{school.name}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering students to reach their full potential through quality education and character development.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Home</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">About Us</a></li>
                <li><a href="/academics" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Academics</a></li>
                <li><a href="/admissions" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Admissions</a></li>
                <li><a href="/faculty" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Faculty</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300 text-sm">123 Education Street, Academic City</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 text-sm">info@testschool.edu</span>
                </div>
              </div>
            </div>

            {/* Social & Actions */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Connect With Us</h4>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.342-.09.375-.294 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.69-2.436-2.878-2.436-4.633 0-3.777 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.295-.744 2.86-.269 1.031-1.002 2.323-1.492 3.106C9.635 23.564 10.794 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </button>
                  <button className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 border-0 rounded flex items-center justify-center transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.065 0C18.595 0 24 5.405 24 11.935c0 6.531-5.405 11.935-11.935 11.935S.131 18.466.131 11.935C.131 5.405 5.536.001 12.065.001zm2.31 18.477v-6.12H16.4v-1.469h-2.026V9.505c0-.625.325-.959.893-.959h1.136V7.047h-1.668c-1.533 0-2.36.896-2.36 2.375v1.465h-1.399v1.469h1.399v6.120h1.931z"/>
                    </svg>
                  </button>
                </div>
                <a 
                  href="/apply" 
                  className="text-gray-300 hover:text-white transition-colors text-sm no-underline hover:underline inline-flex items-center"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="/terms" className="hover:text-white transition-colors no-underline hover:underline">Terms of Use</a>
                  <a href="/privacy" className="hover:text-white transition-colors no-underline hover:underline">Privacy Policy</a>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span>Built with ❤️ by</span>
                <a 
                  href="https://libdsvi.com" 
                  className="text-gray-300 hover:text-white transition-colors font-medium no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DSVI
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
