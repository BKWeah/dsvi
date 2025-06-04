// Admin permission constants and types
export const ADMIN_LEVELS = {
  SUPER_ADMIN: 1,
  ASSIGNED_STAFF: 2,
} as const;

export type AdminLevel = typeof ADMIN_LEVELS[keyof typeof ADMIN_LEVELS];

// Permission types that can be granted to Level 2 admins
export const PERMISSION_TYPES = {
  // School Website Content Management
  CONTENT_MANAGEMENT: 'content_management',
  CONTENT_APPROVAL: 'content_approval',
  MEDIA_UPLOAD: 'media_upload',
  
  // CMS Access
  CMS_ACCESS: 'cms_access',
  ANNOUNCEMENTS: 'announcements',
  CONTACT_FORMS: 'contact_forms',
  
  // School-Specific Maintenance
  SCHOOL_MAINTENANCE: 'school_maintenance',
  SCHOOL_STATUS: 'school_status',
  
  // Communication Tools
  MESSAGING: 'messaging',
  MESSAGE_TEMPLATES: 'message_templates',
  
  // Subscription Monitoring (View Only)
  SUBSCRIPTION_VIEW: 'subscription_view',
  SUBSCRIPTION_FLAG: 'subscription_flag',
  
  // Support & Training
  ONBOARDING_SUPPORT: 'onboarding_support',
  TRAINING_SESSIONS: 'training_sessions',
  
  // Reports & Logs (Limited Scope)
  ACTIVITY_LOGS: 'activity_logs',
  PERFORMANCE_REPORTS: 'performance_reports',
} as const;

export type PermissionType = typeof PERMISSION_TYPES[keyof typeof PERMISSION_TYPES];

// Permissions that Level 2 admins CANNOT have (Level 1 only)
export const RESTRICTED_PERMISSIONS = {
  // School Admin Management
  INVITE_SCHOOL_ADMINS: 'invite_school_admins',
  APPROVE_SCHOOL_REQUESTS: 'approve_school_requests',
  MANAGE_SCHOOL_ADMINS: 'manage_school_admins',
  
  // Billing & Subscriptions
  BILLING_MANAGEMENT: 'billing_management',
  SUBSCRIPTION_MANAGEMENT: 'subscription_management',
  
  // System Management
  DEPLOY_WEBSITES: 'deploy_websites',
  SYSTEM_SETTINGS: 'system_settings',
  TEMPLATE_MANAGEMENT: 'template_management',
  
  // Admin Management
  CREATE_LEVEL2_ADMINS: 'create_level2_admins',
  MANAGE_LEVEL2_ADMINS: 'manage_level2_admins',
  ASSIGN_PERMISSIONS: 'assign_permissions',
} as const;

export type RestrictedPermission = typeof RESTRICTED_PERMISSIONS[keyof typeof RESTRICTED_PERMISSIONS];

// Helper function to check if a permission is restricted to Level 1 only
export const isRestrictedPermission = (permission: string): boolean => {
  return Object.values(RESTRICTED_PERMISSIONS).includes(permission as RestrictedPermission);
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  CONTENT: [
    PERMISSION_TYPES.CONTENT_MANAGEMENT,
    PERMISSION_TYPES.CONTENT_APPROVAL,
    PERMISSION_TYPES.MEDIA_UPLOAD,
    PERMISSION_TYPES.CMS_ACCESS,
    PERMISSION_TYPES.ANNOUNCEMENTS,
  ],
  COMMUNICATION: [
    PERMISSION_TYPES.MESSAGING,
    PERMISSION_TYPES.MESSAGE_TEMPLATES,
    PERMISSION_TYPES.CONTACT_FORMS,
  ],
  MAINTENANCE: [
    PERMISSION_TYPES.SCHOOL_MAINTENANCE,
    PERMISSION_TYPES.SCHOOL_STATUS,
  ],
  MONITORING: [
    PERMISSION_TYPES.SUBSCRIPTION_VIEW,
    PERMISSION_TYPES.SUBSCRIPTION_FLAG,
    PERMISSION_TYPES.ACTIVITY_LOGS,
    PERMISSION_TYPES.PERFORMANCE_REPORTS,
  ],
  SUPPORT: [
    PERMISSION_TYPES.ONBOARDING_SUPPORT,
    PERMISSION_TYPES.TRAINING_SESSIONS,
  ],
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_TYPES.CONTENT_MANAGEMENT]: 'Add or update school pages (About, Academics, Admissions)',
  [PERMISSION_TYPES.CONTENT_APPROVAL]: 'Approve or revise submitted content',
  [PERMISSION_TYPES.MEDIA_UPLOAD]: 'Upload images, documents, or staff profiles',
  [PERMISSION_TYPES.CMS_ACCESS]: 'Access CMS dashboard for assigned schools',
  [PERMISSION_TYPES.ANNOUNCEMENTS]: 'Edit announcements or homepage highlights',
  [PERMISSION_TYPES.CONTACT_FORMS]: 'Manage contact form inquiries',
  [PERMISSION_TYPES.SCHOOL_MAINTENANCE]: 'Perform updates or minor fixes on selected school sites',
  [PERMISSION_TYPES.SCHOOL_STATUS]: 'Set school status as "Self-managed" or "DSVI-managed"',
  [PERMISSION_TYPES.MESSAGING]: 'Send in-app or email messages to assigned schools',
  [PERMISSION_TYPES.MESSAGE_TEMPLATES]: 'Use message templates (welcome notices, renewal reminders)',
  [PERMISSION_TYPES.SUBSCRIPTION_VIEW]: 'View subscription status for specific schools',
  [PERMISSION_TYPES.SUBSCRIPTION_FLAG]: 'Flag expiring subscriptions for follow-up',
  [PERMISSION_TYPES.ONBOARDING_SUPPORT]: 'Provide onboarding assistance to new schools',
  [PERMISSION_TYPES.TRAINING_SESSIONS]: 'Schedule or deliver training sessions',
  [PERMISSION_TYPES.ACTIVITY_LOGS]: 'View activity logs for assigned schools only',
  [PERMISSION_TYPES.PERFORMANCE_REPORTS]: 'Generate performance summaries or updates for reporting',
} as const;

// Interface for admin profile
export interface AdminProfile {
  id: string;
  user_id: string;
  admin_level: AdminLevel;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  notes: string | null;
}

// Interface for admin permissions
export interface AdminPermission {
  id: string;
  admin_user_id: string;
  permission_type: PermissionType;
  resource_id: string | null; // school_id for school-specific permissions
  granted_by: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

// Interface for admin assignments
export interface AdminAssignment {
  id: string;
  admin_user_id: string;
  school_id: string;
  assigned_by: string | null;
  created_at: string;
  is_active: boolean;
}
