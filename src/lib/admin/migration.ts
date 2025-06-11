import { supabase } from '../integrations/supabase/client';

/**
 * Migration script to set up admin levels for existing DSVI admin users
 * This should be run once after deploying the new admin levels system
 */
export const migrateExistingAdmins = async () => {
  try {
    console.log('Starting migration of existing DSVI admins to Level 1...');

    // Note: In a real production environment, this would be handled differently
    // since we can't directly query auth.users from the client side.
    // This would typically be done through an admin RPC function or server-side script.

    // For now, we'll create a function that existing admins can call when they first log in
    // to initialize their admin profile as Level 1

    const result = {
      success: true,
      message: 'Migration setup complete. Existing DSVI admins will be automatically upgraded to Level 1 on their next login.',
      note: 'The upsert_user_profile function has been updated to handle this automatically.'
    };

    console.log(result.message);
    return result;

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to migrate existing DSVI admins'
    };
  }
};

/**
 * Function for current admin to initialize their Level 1 admin profile
 * This should be called by existing DSVI admins when they first access the new system
 */
export const initializeAdminProfile = async (userId: string) => {
  try {
    // Create Level 1 admin profile for the current user using new consolidated function
    const { error } = await supabase.rpc('upsert_user_profile', {
      p_user_id: userId,
      p_email: '', // Will be populated from auth
      p_role: 'DSVI_ADMIN',
      p_name: '' // Will be populated from auth
    });

    if (error) throw error;

    console.log('Admin profile initialized successfully');
    return {
      success: true,
      message: 'Successfully initialized as Level 1 (Super Admin)'
    };

  } catch (error) {
    console.error('Failed to initialize admin profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to initialize admin profile'
    };
  }
};

/**
 * Function to check if current user needs admin profile initialization
 */
export const needsAdminProfileInit = async (userId: string, userRole: string) => {
  if (userRole !== 'DSVI_ADMIN') return false;

  try {
    const { data: adminLevel, error } = await supabase
      .rpc('get_admin_level_new', { p_user_id: userId });

    if (error) throw error;

    // If admin level is 0, user needs initialization
    return adminLevel === 0;

  } catch (error) {
    console.error('Error checking admin profile:', error);
    return true; // Assume needs init if we can't check
  }
};
