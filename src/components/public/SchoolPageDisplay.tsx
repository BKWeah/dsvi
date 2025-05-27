
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Page {
  id: string;
  title: string;
  content: string | null;
  page_type: string;
}

interface School {
  id: string;
  name: string;
  slug: string;
}

export function SchoolPageDisplay() {
  const { schoolSlug, pageType = 'homepage' } = useParams<{ schoolSlug: string; pageType?: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (schoolSlug) {
      fetchSchoolAndPage();
    }
  }, [schoolSlug, pageType]);

  const fetchSchoolAndPage = async () => {
    try {
      // First get the school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', schoolSlug)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Then get the page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('school_id', schoolData.id)
        .eq('page_type', pageType)
        .single();

      if (pageError) {
        console.error('Page not found:', pageError);
        setPage(null);
      } else {
        setPage(pageData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set page title for SEO
    if (page && school) {
      document.title = `${page.title} - ${school.name}`;
    }
  }, [page, school]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is coming soon. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {page.content ? (
              <div className="whitespace-pre-wrap">{page.content}</div>
            ) : (
              <p className="text-muted-foreground">Content coming soon...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
