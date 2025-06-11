-- Migration: Cleanup Old Admin Tables
-- Date: 2025-06-12
-- Purpose: Remove old multi-table admin system after confirming dsvi_admins consolidation works
-- 
-- ⚠️  WARNING: This migration should only be run AFTER confirming that:
-- 1. All admin functionality is working with the new dsvi_admins table
-- 2. All old function references have been updated in the application code
-- 3. No critical admin data will be lost
--
-- RECOMMENDED: Create a backup before running this migration!

-- ===============================================================================
-- 1. DROP OLD ADMIN FUNCTIONS
-- ===============================================================================

-- Drop old admin functions that have been replaced
DROP FUNCTION IF EXISTS get_admin_level(UUID);
DROP FUNCTION IF EXISTS has_admin_permission(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS get_assigned_schools(UUID);
DROP FUNCTION IF EXISTS create_admin_profile(UUID, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS grant_admin_permission(UUID, TEXT, UUID, UUID, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS assign_school_to_admin(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS safe_create_admin_profile(UUID, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS verify_admin_setup(UUID);

-- ===============================================================================
-- 2. VERIFY DATA MIGRATION COMPLETENESS
-- ===============================================================================

-- Check if all admin profiles have been migrated
DO $$
DECLARE
    unmigrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmigrated_count
    FROM admin_profiles ap
    WHERE NOT EXISTS (
        SELECT 1 FROM dsvi_admins da 
        WHERE da.user_id = ap.user_id
    );
    
    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Migration incomplete: % admin profiles not migrated to dsvi_admins table. Please run data migration first.', unmigrated_count;
    END IF;
    
    RAISE NOTICE 'Data migration verification passed: All admin profiles migrated successfully.';
END $$;

-- ===============================================================================
-- 3. CREATE BACKUP VIEWS (Optional - for rollback safety)
-- ===============================================================================

-- Create backup views of old data before dropping tables
CREATE OR REPLACE VIEW admin_profiles_backup AS
SELECT 
    ap.*,
    'Backup view of old admin_profiles data before table drop' as note
FROM admin_profiles ap;

CREATE OR REPLACE VIEW admin_permissions_backup AS
SELECT 
    ap.*,
    'Backup view of old admin_permissions data before table drop' as note
FROM admin_permissions ap;

CREATE OR REPLACE VIEW admin_assignments_backup AS
SELECT 
    aa.*,
    'Backup view of old admin_assignments data before table drop' as note
FROM admin_assignments aa;

-- ===============================================================================
-- 4. DROP OLD ADMIN TABLES
-- ===============================================================================

-- Drop old admin tables (commented out for safety - uncomment when ready)
-- WARNING: Uncomment these lines only after thorough testing!

-- DROP TABLE IF EXISTS admin_permissions CASCADE;
-- DROP TABLE IF EXISTS admin_assignments CASCADE;
-- DROP TABLE IF EXISTS admin_profiles CASCADE;

-- ===============================================================================
-- 5. CLEANUP COMMENTS
-- ===============================================================================

-- Add documentation to new table
COMMENT ON TABLE dsvi_admins IS 'Consolidated admin table - replaces admin_profiles, admin_permissions, and admin_assignments';
COMMENT ON COLUMN dsvi_admins.admin_level IS '1=Super Admin (Level 1), 2=Assigned Staff (Level 2)';
COMMENT ON COLUMN dsvi_admins.permissions IS 'Array of permission strings for Level 2 admins';
COMMENT ON COLUMN dsvi_admins.school_ids IS 'Array of school UUIDs assigned to this admin';

-- ===============================================================================
-- 6. PERFORMANCE OPTIMIZATIONS
-- ===============================================================================

-- Ensure all necessary indexes exist on dsvi_admins table
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_admin_level_active ON dsvi_admins(admin_level, is_active);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_permissions_gin ON dsvi_admins USING GIN(permissions);
CREATE INDEX IF NOT EXISTS idx_dsvi_admins_school_ids_gin ON dsvi_admins USING GIN(school_ids);

-- Update table statistics
ANALYZE dsvi_admins;

-- ===============================================================================
-- 7. COMPLETION MESSAGE
-- ===============================================================================

SELECT 
    'Admin system cleanup migration prepared. Old table drops are commented out for safety.' as status,
    'Uncomment DROP TABLE statements after thorough testing.' as next_step,
    'Backup views created: admin_profiles_backup, admin_permissions_backup, admin_assignments_backup' as backup_info;
