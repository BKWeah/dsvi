// Admin system exports
export * from './permissions';
export * from './useAdmin';
export * from './migration';

// Main exports for easy importing
export { useAdmin } from './useAdmin';
export { 
  ADMIN_LEVELS, 
  PERMISSION_TYPES, 
  RESTRICTED_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_DESCRIPTIONS,
  isRestrictedPermission 
} from './permissions';
export { 
  migrateExistingAdmins, 
  initializeAdminProfile, 
  needsAdminProfileInit 
} from './migration';
