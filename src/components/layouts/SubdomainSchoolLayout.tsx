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
    </div>
  );
}
