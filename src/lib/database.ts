import { supabase } from '@/integrations/supabase/client';
import { School, PageContent, ContentSection, AdminSchoolAssignment, ActivityLog, DashboardStats, SchoolWithAssignments } from './types';

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

  // Ensure subscription fields have defaults
  const schoolData = { 
    ...data, 
    slug,
    package_type: data.package_type || 'standard',
    subscription_status: data.subscription_status || 'active',
    auto_renewal: data.auto_renewal !== false, // default to true
    subscription_start: data.subscription_start || new Date().toISOString().split('T')[0],
    subscription_end: data.subscription_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  const { data: createdSchool, error } = await supabase
    .from('schools')
    .insert(schoolData)
    .select()
    .single();

  if (error) throw error;

  // Create subscription history entry
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      await supabase
        .from('subscription_history')
        .insert({
          school_id: createdSchool.id,
          action: 'created',
          new_package: createdSchool.package_type,
          new_end_date: createdSchool.subscription_end,
          amount: createdSchool.package_type === 'advanced' ? 200 : 100,
          payment_method: 'initial_setup',
          notes: 'School created with initial subscription',
          created_by: currentUser.user.id
        });

      // Log the school creation
      await logActivity(
        currentUser.user.id,
        createdSchool.id,
        'SCHOOL_CREATED',
        { 
          school_name: createdSchool.name,
          package_type: createdSchool.package_type,
          subscription_end: createdSchool.subscription_end,
          admin_email: adminEmail 
        }
      );
    }
  } catch (historyError) {
    console.warn('Failed to create subscription history:', historyError);
    // Don't fail the school creation if history fails
  }

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

  // Log the page content update
  const { data: currentUser } = await supabase.auth.getUser();
  if (currentUser.user) {
    await logActivity(
      currentUser.user.id,
      pageData.school_id,
      'PAGE_CONTENT_UPDATED',
      { 
        page_slug: pageData.page_slug,
        page_title: pageData.title,
        sections_count: pageData.sections.length
      }
    );
  }

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
          ctaLink: '/about',
          imageUrl: '/api/placeholder/1920/1080'
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


// ===============================================================================
// PHASE 1: ADMIN ASSIGNMENTS & SUBSCRIPTIONS
// ===============================================================================

// Admin School Assignments
export async function getSchoolAssignments(schoolId?: string, adminId?: string): Promise<AdminSchoolAssignment[]> {
  let query = supabase
    .from('admin_school_assignments')
    .select(`
      *,
      school:schools(id, name, slug),
      school_admin:school_admin_id(id, email, role, name),
      assigned_by_user:assigned_by(id, email, role, name)
    `);

  if (schoolId) query = query.eq('school_id', schoolId);
  if (adminId) query = query.eq('school_admin_id', adminId);

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createSchoolAssignment(assignment: {
  school_admin_id: string;
  school_id: string;
  assigned_by: string;
  permissions?: Record<string, any>;
}): Promise<AdminSchoolAssignment> {
  const { data, error } = await supabase
    .from('admin_school_assignments')
    .insert({
      ...assignment,
      permissions: assignment.permissions || { can_edit: true, can_approve: false, can_manage_content: true }
    })
    .select()
    .single();

  if (error) throw error;

  // Log the assignment
  await logActivity(
    assignment.assigned_by,
    assignment.school_id,
    'SCHOOL_ADMIN_ASSIGNED',
    { assigned_admin: assignment.school_admin_id }
  );

  return data as AdminSchoolAssignment;
}

export async function removeSchoolAssignment(assignmentId: string, removedBy: string): Promise<void> {
  // Get assignment details for logging
  const { data: assignment } = await supabase
    .from('admin_school_assignments')
    .select('school_id, school_admin_id')
    .eq('id', assignmentId)
    .single();

  const { error } = await supabase
    .from('admin_school_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) throw error;

  // Log the removal
  if (assignment) {
    await logActivity(
      removedBy,
      assignment.school_id,
      'SCHOOL_ADMIN_REMOVED',
      { removed_admin: assignment.school_admin_id }
    );
  }
}

export async function getAssignedSchools(adminId: string): Promise<School[]> {
  const { data, error } = await supabase
    .from('admin_school_assignments')
    .select(`
      school:schools(*)
    `)
    .eq('school_admin_id', adminId);

  if (error) throw error;
  return (data?.map(item => item.school).filter(Boolean) || []) as School[];
}

export async function updateSchoolAssignmentPermissions(
  assignmentId: string,
  permissions: Record<string, any>,
  updatedBy: string
): Promise<AdminSchoolAssignment> {
  const { data, error } = await supabase
    .from('admin_school_assignments')
    .update({ 
      permissions,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;

  // Log the permission update
  await logActivity(
    updatedBy,
    data.school_id,
    'ASSIGNMENT_PERMISSIONS_UPDATED',
    { assignment_id: assignmentId, new_permissions: permissions }
  );

  return data as AdminSchoolAssignment;
}

// Activity Logging
export async function logActivity(
  userId: string,
  schoolId: string | null,
  action: string,
  details: Record<string, any> = {}
): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      school_id: schoolId,
      action,
      details
    })
    .select()
    .single();

  if (error) throw error;
  return data as ActivityLog;
}

export async function getActivityLogs(options: {
  userId?: string;
  schoolId?: string;
  action?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<ActivityLog[]> {
  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      user:user_id(id, email, role, name),
      school:school_id(id, name, slug)
    `);

  if (options.userId) query = query.eq('user_id', options.userId);
  if (options.schoolId) query = query.eq('school_id', options.schoolId);
  if (options.action) query = query.eq('action', options.action);

  query = query
    .order('created_at', { ascending: false })
    .limit(options.limit || 50);

  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// Dashboard Statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get school counts
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, subscription_status, package_type');

    if (schoolsError) throw schoolsError;

    // Get pending requests count
    const { data: requests, error: requestsError } = await supabase
      .from('school_requests')
      .select('id')
      .eq('status', 'pending');

    if (requestsError) throw requestsError;

    // Get recent activity (simplified query without joins for now)
    const { data: recentActivityData, error: activityError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) {
      console.warn('Activity logs error, using empty array:', activityError);
    }

    const recentActivity = (recentActivityData || []).map(log => ({
      ...log,
      user: null, // Will be populated later when foreign keys are fixed
      school: schools?.find(s => s.id === log.school_id) || null
    })) as ActivityLog[];

    // Calculate stats
    const totalSchools = schools?.length || 0;
    const activeSchools = schools?.filter(s => s.subscription_status === 'active').length || 0;
    const inactiveSchools = schools?.filter(s => s.subscription_status === 'inactive').length || 0;
    const expiringSchools = schools?.filter(s => s.subscription_status === 'expiring').length || 0;
    const pendingRequests = requests?.length || 0;

    const subscriptionBreakdown = {
      standard: schools?.filter(s => s.package_type === 'standard').length || 0,
      advanced: schools?.filter(s => s.package_type === 'advanced').length || 0
    };

    return {
      totalSchools,
      activeSchools,
      inactiveSchools,
      expiringSchools,
      pendingRequests,
      recentActivity,
      subscriptionBreakdown
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    // Return fallback data
    return {
      totalSchools: 0,
      activeSchools: 0,
      inactiveSchools: 0,
      expiringSchools: 0,
      pendingRequests: 0,
      recentActivity: [],
      subscriptionBreakdown: {
        standard: 0,
        advanced: 0
      }
    };
  }
}

// Enhanced School Functions with Assignments
export async function getSchoolsWithAssignments(): Promise<SchoolWithAssignments[]> {
  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      assignments:admin_school_assignments(
        id,
        school_admin_id,
        permissions,
        created_at,
        school_admin:school_admin_id(id, email, user_metadata)
      )
    `)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function updateSchoolWithSubscription(
  schoolId: string,
  data: Partial<School>
): Promise<School> {
  const { data: updatedSchool, error } = await supabase
    .from('schools')
    .update({ 
      ...data, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', schoolId)
    .select()
    .single();

  if (error) throw error;

  // Log the update
  const currentUser = await supabase.auth.getUser();
  if (currentUser.data.user) {
    await logActivity(
      currentUser.data.user.id,
      schoolId,
      'SCHOOL_UPDATED',
      { updated_fields: Object.keys(data) }
    );
  }

  return updatedSchool as School;
}

// Check if user has access to school
export async function hasSchoolAccess(userId: string, schoolId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const userRole = user.user.user_metadata?.role;

  // DSVI Admins have access to all schools
  if (userRole === 'DSVI_ADMIN') return true;

  // School Admins need to check assignments
  if (userRole === 'SCHOOL_ADMIN') {
    // Check if they're the direct admin
    const { data: school } = await supabase
      .from('schools')
      .select('admin_user_id')
      .eq('id', schoolId)
      .single();

    if (school?.admin_user_id === userId) return true;

    // Check assignments
    const { data: assignment } = await supabase
      .from('admin_school_assignments')
      .select('id')
      .eq('school_admin_id', userId)
      .eq('school_id', schoolId)
      .single();

    return !!assignment;
  }

  return false;
}