
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { FullScreenMobileMenu } from '@/components/mobile/FullScreenMobileMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { generateSchoolUrl } from '@/lib/subdomain-utils';
import { School, ComprehensiveThemeSettings } from '@/lib/types'; // Removed Json
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react'; // Added ChevronDown

const PAGE_TYPES = [
  { type: 'homepage', label: 'Home' },
  { type: 'about-us', label: 'About Us' },
  { type: 'academics', label: 'Academics' },
  { type: 'admissions', label: 'Admissions' },
  { type: 'faculty', label: 'Faculty' },
  { type: 'team', label: 'Team' }, // Added Team page type
  { type: 'contact', label: 'Contact' }
];

const TEAM_SUBSECTIONS = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'operations', label: 'Operations' },
  { id: 'it', label: 'IT' },
  { id: 'support', label: 'Support' },
  { id: 'media', label: 'Media' },
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
      setSchool({
        ...data,
        theme_settings: data.theme_settings as ComprehensiveThemeSettings,
        contact_info: data.contact_info as { address?: string; phone?: string; email?: string; mapEmbedUrl?: string; } | null,
        package_type: data.package_type as 'standard' | 'advanced' | undefined, // Explicitly cast package_type
        subscription_status: data.subscription_status as 'active' | 'expiring' | 'inactive' | 'trial' | undefined, // Explicitly cast subscription_status
        payment_status: data.payment_status as 'paid' | 'pending' | 'overdue' | undefined // Explicitly cast payment_status
      } as School); // Explicitly cast data and its nested properties
      
      // Apply the school's theme
      if (data) {
        applyTheme({ 
          ...data, 
          theme_settings: data.theme_settings as ComprehensiveThemeSettings,
          contact_info: data.contact_info as { address?: string; phone?: string; email?: string; mapEmbedUrl?: string; } | null,
          package_type: data.package_type as 'standard' | 'advanced' | undefined, // Explicitly cast package_type
          subscription_status: data.subscription_status as 'active' | 'expiring' | 'inactive' | 'trial' | undefined, // Explicitly cast subscription_status
          payment_status: data.payment_status as 'paid' | 'pending' | 'overdue' | undefined // Explicitly cast payment_status
        }); // Explicitly cast theme_settings, contact_info, and package_type
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
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
        {/* Top contact bar - hidden on mobile */}
        <div className="hidden md:block bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                {school.contact_info?.phone && (
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>{school.contact_info.phone}</span>
                  </div>
                )}
                {school.contact_info?.email && (
                  <div className="flex items-center space-x-2">
                    <span>✉️</span>
                    <span>{school.contact_info.email}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main navigation */}
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
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {PAGE_TYPES.map((pageType) => (
                  pageType.type === 'team' ? (
                    <NavigationMenuItem key={pageType.type}>
                      <NavigationMenuTrigger 
                        style={{ 
                          color: 'var(--theme-text-secondary, #475569)',
                          fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
                        }}
                      >
                        {pageType.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 md:w-[200px] md:grid-cols-1 lg:w-[200px]">
                          {TEAM_SUBSECTIONS.map((subsection) => (
                            <li key={subsection.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={generateSchoolUrl(school.slug, pageType.type, subsection.id)}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">{subsection.label}</div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={pageType.type}>
                      <Link
                        to={generateSchoolUrl(school.slug, pageType.type)}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        style={{ 
                          color: 'var(--theme-text-secondary, #475569)',
                          fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)'
                        }}
                      >
                        {pageType.label}
                      </Link>
                    </NavigationMenuItem>
                  )
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            
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

      {/* DSVI Standard Footer */}
      <footer className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                {PAGE_TYPES.map((pageType) => (
                  <li key={pageType.type}>
                    {pageType.type === 'team' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="text-slate-300 hover:text-white transition-colors text-sm flex items-center">
                          {pageType.label} <ChevronDown className="ml-1 h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {TEAM_SUBSECTIONS.map((subsection) => (
                            <DropdownMenuItem key={subsection.id}>
                              <Link
                                to={generateSchoolUrl(school.slug, pageType.type, subsection.id)}
                                className="block w-full text-left"
                              >
                                {subsection.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link
                        to={generateSchoolUrl(school.slug, pageType.type)}
                        className="text-slate-300 hover:text-white transition-colors text-sm"
                      >
                        {pageType.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-3">
                {school.contact_info?.address && (
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400">📍</span>
                    <span className="text-slate-300 text-sm">{school.contact_info.address}</span>
                  </div>
                )}
                {school.contact_info?.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">📞</span>
                    <span className="text-slate-300 text-sm">{school.contact_info.phone}</span>
                  </div>
                )}
                {school.contact_info?.email && (
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">✉️</span>
                    <span className="text-slate-300 text-sm">{school.contact_info.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social & Actions */}
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button className="w-8 h-8 bg-blue-600 rounded text-white text-sm">f</button>
                  <button className="w-8 h-8 bg-pink-600 rounded text-white text-sm">i</button>
                  <button className="w-8 h-8 bg-blue-400 rounded text-white text-sm">t</button>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <div>
                <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-1 mt-4 md:mt-0">
                <span>Built with ❤️ by</span>
                <a 
                  href="https://libdsvi.com" 
                  className="text-white hover:text-blue-400 transition-colors font-medium"
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
