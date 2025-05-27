
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

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
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {school.logo_url && (
                <img src={school.logo_url} alt={`${school.name} logo`} className="h-8 w-8 mr-3" />
              )}
              <h1 className="text-xl font-bold">{school.name}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {PAGE_TYPES.map((pageType) => (
                <Link
                  key={pageType.type}
                  to={`/s/${school.slug}/${pageType.type}`}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  {pageType.label}
                </Link>
              ))}
            </nav>
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
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} DSVI. All rights reserved.
            </p>
            <nav className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
