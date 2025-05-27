import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, MoveUp, MoveDown, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/custom/ImageUpload';
import { 
  PageContent, 
  ContentSection, 
  SectionType,
  HeroSectionConfig,
  TextSectionConfig,
  TextWithImageSectionConfig,
  GallerySectionConfig,
  FacultyListSectionConfig,
  ContactFormSectionConfig
} from '@/lib/types';
import { 
  getPageContent, 
  upsertPageContent, 
  generateSectionId, 
  createDefaultSections,
  uploadSectionImage 
} from '@/lib/database';

interface PageEditorProps {
  schoolId: string;
  pageSlug: string;
  onSave?: () => void;
}

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'text', label: 'Text Section' },
  { value: 'textWithImage', label: 'Text with Image' },
  { value: 'gallery', label: 'Image Gallery' },
  { value: 'facultyList', label: 'Faculty List' },
  { value: 'contactForm', label: 'Contact Form' },
];

export function PageEditor({ schoolId, pageSlug, onSave }: PageEditorProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [sections, setSections] = useState<ContentSection[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPageContent();
  }, [schoolId, pageSlug]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const data = await getPageContent(schoolId, pageSlug);
      
      if (data) {
        setPageContent(data);
        setTitle(data.title);
        setMetaDescription(data.meta_description || '');
        setSections(data.sections || []);
      } else {
        const defaultTitle = pageSlug === 'homepage' ? 'Welcome' : 
          pageSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        setTitle(defaultTitle);
        setMetaDescription('');
        setSections(createDefaultSections(pageSlug));
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast({
        title: "Error",
        description: "Failed to load page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const pageData: Omit<PageContent, 'id' | 'created_at' | 'updated_at'> = {
        school_id: schoolId,
        page_slug: pageSlug,
        title,
        meta_description: metaDescription || null,
        sections
      };

      await upsertPageContent(pageData);
      
      toast({
        title: "Success",
        description: "Page saved successfully",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: SectionType) => {
    const newSection: ContentSection = {
      id: generateSectionId(),
      type,
      config: getDefaultConfigForType(type)
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      setSections(newSections);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
    }
  };

  const updateSectionConfig = (sectionId: string, config: any) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, config } : s
    ));
  };

  const getDefaultConfigForType = (type: SectionType): any => {
    switch (type) {
      case 'hero':
        return { title: 'Hero Title', subtitle: '', ctaText: '', ctaLink: '', imageUrl: '' };
      case 'text':
        return { heading: 'Section Heading', body: 'Section content goes here...' };
      case 'textWithImage':
        return { heading: 'Section Heading', body: 'Section content...', imageUrl: '', imagePosition: 'right' };
      case 'gallery':
        return { images: [] };
      case 'facultyList':
        return { facultyMembers: [] };
      case 'contactForm':
        return { title: 'Contact Us', description: '' };
      default:
        return {};
    }
  };

  if (loading) {
    return <div className="p-6">Loading page editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Edit Page: {pageSlug}</h2>
          <p className="text-muted-foreground">Manage the content sections for this page</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Page'}
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Page Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta">Meta Description (SEO)</Label>
                <Textarea
                  id="meta"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Page Sections</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SECTION_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => addSection(type.value)}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {sections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No sections yet. Add your first section above.</p>
                </CardContent>
              </Card>
            ) : (
              sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  index={index}
                  totalSections={sections.length}
                  onUpdate={(config) => updateSectionConfig(section.id, config)}
                  onMoveUp={() => moveSectionUp(index)}
                  onMoveDown={() => moveSectionDown(index)}
                  onDelete={() => removeSection(section.id)}
                  schoolId={schoolId}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Section Editor Component
interface SectionEditorProps {
  section: ContentSection;
  index: number;
  totalSections: number;
  onUpdate: (config: any) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  schoolId: string;
}

function SectionEditor({ 
  section, 
  index, 
  totalSections, 
  onUpdate, 
  onMoveUp, 
  onMoveDown, 
  onDelete,
  schoolId 
}: SectionEditorProps) {
  const getSectionTypeName = (type: SectionType) => {
    return SECTION_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{getSectionTypeName(section.type)}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveDown}
            disabled={index === totalSections - 1}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this section? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <SectionConfigEditor
          type={section.type}
          config={section.config}
          onUpdate={onUpdate}
          schoolId={schoolId}
          sectionId={section.id}
        />
      </CardContent>
    </Card>
  );
}

// Section Config Editor Component
interface SectionConfigEditorProps {
  type: SectionType;
  config: any;
  onUpdate: (config: any) => void;
  schoolId: string;
  sectionId: string;
}

function SectionConfigEditor({ type, config, onUpdate, schoolId, sectionId }: SectionConfigEditorProps) {
  const handleInputChange = (field: string, value: any) => {
    onUpdate({ ...config, [field]: value });
  };

  const handleImageUpload = async (file: File, field: string) => {
    try {
      const imageUrl = await uploadSectionImage(schoolId, sectionId, file);
      handleInputChange(field, imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={config.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Hero title"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={config.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Hero subtitle"
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Button Text</Label>
            <Input
              value={config.ctaText || ''}
              onChange={(e) => handleInputChange('ctaText', e.target.value)}
              placeholder="Button text"
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Link</Label>
            <Input
              value={config.ctaLink || ''}
              onChange={(e) => handleInputChange('ctaLink', e.target.value)}
              placeholder="Button link URL"
            />
          </div>
          <ImageUpload
            label="Background Image"
            value={config.imageUrl || ''}
            onChange={(url) => handleInputChange('imageUrl', url)}
            schoolId={schoolId}
            sectionId={sectionId}
            placeholder="Upload background image or enter URL"
          />
        </div>
      );

    case 'text':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={config.heading || ''}
              onChange={(e) => handleInputChange('heading', e.target.value)}
              placeholder="Section heading"
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={config.body || ''}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Section content..."
              rows={6}
            />
          </div>
        </div>
      );

    case 'textWithImage':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={config.heading || ''}
              onChange={(e) => handleInputChange('heading', e.target.value)}
              placeholder="Section heading"
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={config.body || ''}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Section content..."
              rows={4}
            />
          </div>
          <ImageUpload
            label="Section Image"
            value={config.imageUrl || ''}
            onChange={(url) => handleInputChange('imageUrl', url)}
            schoolId={schoolId}
            sectionId={sectionId}
            placeholder="Upload section image or enter URL"
          />
          <div className="space-y-2">
            <Label>Image Position</Label>
            <Select 
              value={config.imagePosition || 'right'} 
              onValueChange={(value) => handleInputChange('imagePosition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <Label>Gallery Images</Label>
          <p className="text-sm text-muted-foreground">
            Gallery editor will be available soon. For now, please contact an administrator.
          </p>
        </div>
      );

    case 'facultyList':
      return (
        <div className="space-y-4">
          <Label>Faculty Members</Label>
          <p className="text-sm text-muted-foreground">
            Faculty list editor will be available soon. For now, please contact an administrator.
          </p>
        </div>
      );

    case 'contactForm':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={config.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Contact form title"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={config.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Contact form description..."
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 text-center text-muted-foreground">
          Unknown section type: {type}
        </div>
      );
  }
}
