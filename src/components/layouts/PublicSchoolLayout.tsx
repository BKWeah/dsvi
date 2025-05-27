
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';

interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

const PAGE_TYPES = [
  { type: 'homepage', label: 'Home', path: 'homepage' },
  { type: 'about-us', label: 'About Us', path: 'about-us' },
  { type: 'academics', label: 'Academics', path: 'academics' },
  { type: 'admissions', label: 'Admissions', path: 'admissions' },
  { type: 'faculty', label: 'Faculty', path: 'faculty' },
  { type: 'contact', label: 'Contact', path: 'contact' }
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
          <h1 className="text-2xl font-bold">School Not Found</h1>
          <p className="text-muted-foreground">The school you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {school.logo_url && (
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} logo`}
                  className="h-10 w-10 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold">{school.name}</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-4">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                {PAGE_TYPES.map((pageType) => (
                  <NavigationMenuItem key={pageType.type}>
                    <NavigationMenuLink asChild>
                      <Link 
                        to={`/s/${schoolSlug}/${pageType.path}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        {pageType.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet context={{ school }} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2024 {school.name}. All rights reserved.</p>
            <p className="mt-2">Powered by DSVI Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
