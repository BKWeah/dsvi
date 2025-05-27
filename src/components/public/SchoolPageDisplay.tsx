
import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface Page {
  id: string;
  title: string;
  content: string | null;
  page_type: string;
}

interface OutletContext {
  school: School;
}

export function SchoolPageDisplay() {
  const { schoolSlug, pageType } = useParams<{ schoolSlug: string; pageType: string }>();
  const { school } = useOutletContext<OutletContext>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (school && pageType) {
      fetchPage();
    }
  }, [school, pageType]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map URL paths to page types
      const pageTypeMap: Record<string, string> = {
        'homepage': 'homepage',
        'about-us': 'about-us',
        'academics': 'academics',
        'admissions': 'admissions',
        'faculty': 'faculty',
        'contact': 'contact'
      };

      const actualPageType = pageTypeMap[pageType || ''] || pageType;

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('school_id', school.id)
        .eq('page_type', actualPageType)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          setError('Page not found');
        } else {
          throw error;
        }
      } else {
        setPage(data);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  // Set page title for SEO
  useEffect(() => {
    if (page && school) {
      document.title = `${page.title} | ${school.name}`;
    } else if (school) {
      document.title = school.name;
    }

    return () => {
      document.title = 'DSVI Platform';
    };
  }, [page, school]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Page Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || 'This page is not available yet. Please check back later.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {page.content ? (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {page.content}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Content coming soon...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
