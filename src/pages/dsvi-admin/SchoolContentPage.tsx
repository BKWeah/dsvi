
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { useToast } from '@/hooks/use-toast';
import { useSchoolAccess } from '@/hooks/useSchoolAccess';

interface School {
  id: string;
  name: string;
  slug: string;
}

interface Page {
  id: string;
  page_type: string;
  title: string;
  content: string | null;
}

const PAGE_TYPES = [
  { type: 'homepage', label: 'Homepage' },
  { type: 'about-us', label: 'About Us' },
  { type: 'academics', label: 'Academics' },
  { type: 'admissions', label: 'Admissions' },
  { type: 'faculty', label: 'Faculty' },
  { type: 'contact', label: 'Contact' }
];

export default function SchoolContentPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasAccess, loading: accessLoading } = useSchoolAccess(schoolId);

  useEffect(() => {
    if (schoolId && hasAccess && !accessLoading) {
      fetchSchoolAndPages();
    } else if (!accessLoading && !hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this school",
        variant: "destructive",
      });
      navigate('/dsvi-admin/schools');
    }
  }, [schoolId, hasAccess, accessLoading]);

  const fetchSchoolAndPages = async () => {
    try {
      // Fetch school details
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Fetch pages for this school
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('school_id', schoolId)
        .order('page_type');

      if (pagesError) throw pagesError;
      setPages(pagesData || []);
    } catch (error) {
      console.error('Error fetching school and pages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar 
          title="School Content" 
          subtitle="Loading..." 
          backUrl="/dsvi-admin/schools" 
        />
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading school content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopBar 
          title="School Content" 
          subtitle="Error" 
          backUrl="/dsvi-admin/schools" 
        />
        <div className="p-4">
          <p className="text-muted-foreground">School not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <MobileTopBar 
        title="School Content" 
        subtitle={school.name} 
        backUrl="/dsvi-admin/schools" 
      />

      <div className="p-4 space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dsvi-admin/schools')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Content: {school.name}</h1>
            <p className="text-muted-foreground">Manage all pages for this school</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PAGE_TYPES.map((pageType) => {
            const page = pages.find(p => p.page_type === pageType.type);
            return (
              <Card key={pageType.type}>
                <CardHeader>
                  <CardTitle className="text-lg">{pageType.label}</CardTitle>
                  <CardDescription>
                    {page ? `Title: ${page.title}` : 'Page not found'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={`/dsvi-admin/schools/${schoolId}/pages/${pageType.type}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
