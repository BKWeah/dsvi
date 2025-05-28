
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { FullScreenMobileMenu } from '@/components/mobile/FullScreenMobileMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { School } from '@/lib/types';

const PAGE_TYPES = [
  { type: 'homepage', label: 'Home' },
  { type: 'about-us', label: 'About Us' },
  { type: 'academics', label: 'Academics' },
  { type: 'admissions', label: 'Admissions' },
  { type: 'faculty', label: 'Faculty' },
  { type: 'contact', label: 'Contact' }
];

export function PublicSchoolLayout() {
  const { schoolSlug } = useParams<{ schoolSlug: string }>();
  const location = useLocation();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const { applyTheme, isThemeLoaded } = useTheme();

  // Get current page from URL
  const currentPage = location.pathname.split('/').pop() || 'homepage';

  useEffect(() => {
    if (schoolSlug) {
      fetchSchool();
    }
  }, [schoolSlug]);

  const fetchSchool = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', schoolSlug)
        .single();

      if (error) throw error;
      setSchool(data);
      
      // Apply the school's theme
      if (data) {
        applyTheme(data);
      }
    } catch (error) {
      console.error('Error fetching school:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!school) {
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
        className="shadow-sm border-b relative" 
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
              {PAGE_TYPES.map((pageType) => (
                <Link
                  key={pageType.type}
                  to={`/s/${school.slug}/${pageType.type}`}
                  className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-75"
                  style={{ 
                    color: 'var(--theme-text-secondary, #475569)',
                    fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
                  }}
                >
                  {pageType.label}
                </Link>
              ))}
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

      {/* <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>© {new Date().getFullYear()} {school.name}. Powered by DSVI.</p>
          </div>
        </div>
      </footer> */}

      {/* Footer */}
      <footer 
        className="mt-12 pt-8 border-t text-center"
        style={{ 
          backgroundColor: 'var(--theme-surface, #f8fafc)',
          borderColor: 'var(--theme-border, #e2e8f0)',
          color: 'var(--theme-text-secondary, #475569)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p 
              className="text-sm mb-4 md:mb-0"
              style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
            >
              &copy; {new Date().getFullYear()} DSVI. All rights reserved.
            </p>
            <nav className="flex space-x-4">
              <a 
                href="#" 
                className="text-sm hover:opacity-75 transition-colors"
                style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-sm hover:opacity-75 transition-colors"
                style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-sm hover:opacity-75 transition-colors"
                style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
              >
                Contact Us
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
