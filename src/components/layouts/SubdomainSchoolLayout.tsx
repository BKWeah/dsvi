import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSubdomainSchool } from '@/hooks/useSubdomainSchool';
import { generateSchoolUrl } from '@/lib/subdomain-utils';
import { FullScreenMobileMenu } from '@/components/mobile/FullScreenMobileMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

const PAGE_TYPES = [
  { type: 'homepage', label: 'Home' },
  { type: 'about-us', label: 'About Us' },
  { type: 'academics', label: 'Academics' },
  { type: 'admissions', label: 'Admissions' },
  { type: 'faculty', label: 'Faculty' },
  { type: 'contact', label: 'Contact' }
];

export function SubdomainSchoolLayout() {
  const { school, loading, error } = useSubdomainSchool();
  const location = useLocation();
  const { applyTheme } = useTheme();

  // Get current page from URL (for subdomain routing, it's just the pathname)
  const currentPage = location.pathname === '/' ? 'homepage' : location.pathname.slice(1);

  React.useEffect(() => {
    if (school) {
      applyTheme(school);
    }
  }, [school, applyTheme]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">School Not Found</h1>
          <p className="text-muted-foreground">The school you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-background, #ffffff)' }}>
      <header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" 
        style={{ 
          backgroundColor: 'var(--theme-surface, #ffffff)',
          borderColor: 'var(--theme-border, #e2e8f0)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {school.logo_url && (
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} logo`} 
                  className="h-8 w-8 mr-3" 
                  style={{ height: 'var(--theme-logo-size, 2rem)', width: 'auto' }}
                />
              )}
              <h1 
                className="text-xl font-bold"
                style={{ 
                  color: 'var(--theme-text-primary, #0f172a)',
                  fontFamily: 'var(--theme-font-display, Inter, system-ui, sans-serif)'
                }}
              >
                {school.name}
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {PAGE_TYPES.map((pageType) => {
                const href = pageType.type === 'homepage' ? '/' : `/${pageType.type}`;
                return (
                  <Link
                    key={pageType.type}
                    to={href}
                    className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-75"
                    style={{ 
                      color: 'var(--theme-text-secondary, #475569)',
                      fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
                    }}
                  >
                    {pageType.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile Menu */}
            <FullScreenMobileMenu 
              schoolSlug={school.slug} 
              currentPage={currentPage}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer 
        className="bg-slate-950 text-white"
        style={{ 
          backgroundColor: 'var(--theme-surface, #0f172a)',
          color: 'var(--theme-text-secondary, #e2e8f0)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* School Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {school.logo_url && (
                  <img 
                    src={school.logo_url} 
                    alt={`${school.name} Logo`} 
                    className="h-8 w-auto brightness-0 invert"
                  />
                )}
                <h3 className="text-lg font-bold">{school.name}</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Empowering students to reach their full potential through quality education and character development.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {PAGE_TYPES.map((pageType) => {
                  const href = pageType.type === 'homepage' ? '/' : `/${pageType.type}`;
                  return (
                    <li key={pageType.type}>
                      <Link 
                        to={href}
                        className="text-slate-300 hover:text-white transition-colors text-sm"
                      >
                        {pageType.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-3 text-sm">
                {school.contact_info?.address && (
                  <p className="text-slate-300">{school.contact_info.address}</p>
                )}
                {school.contact_info?.phone && (
                  <p className="text-slate-300">{school.contact_info.phone}</p>
                )}
                {school.contact_info?.email && (
                  <p className="text-slate-300">{school.contact_info.email}</p>
                )}
              </div>
            </div>

            {/* Social & Actions */}
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                    <Instagram className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8">
            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <div className="mb-4 md:mb-0">
                <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-1">
                <span>Built with ❤️ by</span>
                <a 
                  href="https://libdsvi.com" 
                  className="text-white hover:text-primary transition-colors font-medium"
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
