
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Page {
  id: string;
  title: string;
  content: string | null;
  page_type: string;
  school_id: string;
}

interface School {
  id: string;
  name: string;
  slug: string;
}

export default function EditSchoolPagePage() {
  const { pageType } = useParams<{ pageType: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && pageType) {
      fetchSchoolAndPage();
    }
  }, [user, pageType]);

  const fetchSchoolAndPage = async () => {
    try {
      // First get the school for this admin
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('admin_user_id', user?.id)
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

      if (pageError) throw pageError;
      
      setPage(pageData);
      setTitle(pageData.title);
      setContent(pageData.content || '');
    } catch (error) {
      console.error('Error fetching page:', error);
      toast({
        title: "Error",
        description: "Failed to fetch page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', page?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading page...</div>;
  }

  if (!page || !school) {
    return <div>Page not found</div>;
  }

  const formatPageType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit {formatPageType(pageType || '')}</h1>
        <p className="text-muted-foreground">Update the content for your school's {formatPageType(pageType || '').toLowerCase()} page</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>
            Edit the title and content for this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Page Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter page content..."
                rows={15}
                className="min-h-[300px]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (school) {
                    window.open(`/s/${school.slug}/${pageType}`, '_blank');
                  }
                }}
              >
                Preview Site
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
