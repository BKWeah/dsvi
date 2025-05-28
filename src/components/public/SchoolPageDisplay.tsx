
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SchoolPageRenderer from '@/components/templates/SchoolPageRenderer';
import { getSchoolBySlug, getPageContent, createDefaultSections } from '@/lib/database';
import { School, PageContent } from '@/lib/types';
import { applyTheme } from '@/lib/theme-utils';

export function SchoolPageDisplay() {
  const { schoolSlug, pageType = 'homepage' } = useParams<{ schoolSlug: string; pageType?: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schoolSlug) {
      fetchSchoolAndPage();
    }
    
    // Cleanup theme styles when component unmounts or schoolSlug changes
    return () => {
      const existingStyle = document.getElementById('theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [schoolSlug, pageType]);

  const fetchSchoolAndPage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get school data
      const schoolData = await getSchoolBySlug(schoolSlug!);
      if (!schoolData) {
        setError('School not found');
        return;
      }

      setSchool(schoolData.school);

      // Apply school theme if available
      if (schoolData.school.theme_settings) {
        applyTheme(schoolData.school.theme_settings, schoolData.school.custom_css || '');
      }

      // Get specific page content
      const pageData = await getPageContent(schoolData.school.id, pageType || 'homepage');
      
      if (!pageData) {
        // Create a default page if it doesn't exist
        const defaultPage: PageContent = {
          id: '',
          created_at: '',
          updated_at: '',
          school_id: schoolData.school.id,
          page_slug: pageType || 'homepage',
          title: pageType === 'homepage' ? 'Welcome' : pageType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page',
          meta_description: `${pageType} page for ${schoolData.school.name}`,
          sections: createDefaultSections(pageType || 'homepage')
        };
        setPageContent(defaultPage);
      } else {
        setPageContent(pageData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>School Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'The requested school could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageContent) {
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
    <>
      <Helmet>
        <title>{pageContent.title} - {school.name}</title>
        {pageContent.meta_description && (
          <meta name="description" content={pageContent.meta_description} />
        )}
      </Helmet>
      <SchoolPageRenderer school={school} pageContent={pageContent} />
    </>
  );
}
