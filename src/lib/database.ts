import { supabase } from '@/integrations/supabase/client';
import { School, PageContent, ContentSection } from './types';

// School-related functions
export async function getSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getSchoolBySlug(slug: string): Promise<{ school: School; pages: PageContent[] } | null> {
  try {
    // First get the school
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('slug', slug)
      .single();

    if (schoolError || !schoolData) {
      console.error('School not found:', schoolError);
      return null;
    }

    // Then get all pages for this school
    const { data: pagesData, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('school_id', schoolData.id)
      .order('page_slug');

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return { school: schoolData as School, pages: [] };
    }

    return { 
      school: schoolData as School, 
      pages: (pagesData || []) as PageContent[] 
    };
  } catch (error) {
    console.error('Error in getSchoolBySlug:', error);
    return null;
  }
}

export async function getSchoolById(id: string): Promise<{ school: School; pages: PageContent[] } | null> {
  try {
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();

    if (schoolError || !schoolData) return null;

    const { data: pagesData, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('school_id', id)
      .order('page_slug');

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return { school: schoolData as School, pages: [] };
    }

    return { school: schoolData as School, pages: (pagesData || []) as PageContent[] };
  } catch (error) {
    console.error('Error in getSchoolById:', error);
    return null;
  }
}

export async function createSchool(
  data: Omit<School, 'id' | 'created_at' | 'updated_at' | 'slug'>, 
  adminEmail?: string
): Promise<School> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const schoolData = { ...data, slug };

  const { data: createdSchool, error } = await supabase
    .from('schools')
    .insert(schoolData)
    .select()
    .single();

  if (error) throw error;

  if (adminEmail && createdSchool) {
    console.log('Admin email provided:', adminEmail, 'for school:', createdSchool.id);
  }

  return createdSchool as School;
}

export async function updateSchool(
  schoolId: string, 
  data: Partial<Omit<School, 'id' | 'created_at' | 'updated_at'>>
): Promise<School> {
  const { data: updatedSchool, error } = await supabase
    .from('schools')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', schoolId)
    .select()
    .single();

  if (error) throw error;
  return updatedSchool as School;
}

// Page-related functions
export async function getPageContent(schoolId: string, pageSlug: string): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('school_id', schoolId)
    .eq('page_slug', pageSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PageContent;
}

export async function upsertPageContent(pageData: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>): Promise<PageContent> {
  const { data, error } = await supabase
    .from('pages')
    .upsert({
      ...pageData,
      page_type: pageData.page_slug, // Set page_type for backward compatibility
      updated_at: new Date().toISOString()
    }, { onConflict: 'school_id,page_slug' })
    .select()
    .single();

  if (error) throw error;
  return data as PageContent;
}

export async function deletePageContent(pageId: string): Promise<void> {
  const { error } = await supabase.from('pages').delete().eq('id', pageId);
  if (error) throw error;
}

// File upload functions
export async function uploadFile(file: File, path: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadFileWithProgress(
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      duplex: 'half'
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadSchoolLogo(schoolId: string, file: File): Promise<string> {
  return uploadFile(file, `schools/${schoolId}/logo`);
}

export async function uploadSchoolLogoWithProgress(
  schoolId: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadFileWithProgress(file, `schools/${schoolId}/logo`, onProgress);
}

export async function uploadSectionImage(schoolId: string, sectionId: string, file: File): Promise<string> {
  return uploadFile(file, `schools/${schoolId}/sections/${sectionId}`);
}

export function generateSectionId(): string {
  return crypto.randomUUID();
}

export function createDefaultSections(pageSlug: string): ContentSection[] {
  if (pageSlug === 'homepage') {
    return [
      {
        id: generateSectionId(),
        type: 'hero',
        config: {
          title: 'Welcome to Our School',
          subtitle: 'Excellence in Education',
          ctaText: 'Learn More',
          ctaLink: '#about',
          imageUrl: '/placeholder-hero.jpg'
        }
      },
      {
        id: generateSectionId(),
        type: 'text',
        config: {
          heading: 'About Our School',
          body: 'We are committed to providing quality education and fostering a supportive learning environment.'
        }
      }
    ];
  }
  
  return [
    {
      id: generateSectionId(),
      type: 'text',
      config: {
        heading: 'Page Content',
        body: 'This page is under construction. Please check back soon for updates.'
      }
    }
  ];
}
