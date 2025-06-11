-- ===============================================================================
-- STEP 2: CREATE MISSING TABLES (if needed)
-- Only run this if tables are missing from Step 1
-- ===============================================================================

-- Create user_profiles table if missing
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_profiles table if missing
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_level INTEGER NOT NULL CHECK (admin_level IN (1, 2)),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(user_id)
);

-- Create admin_permissions table if missing
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL,
    resource_id UUID,
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(admin_user_id, permission_type, resource_id)
);

-- Create admin_assignments table if missing
CREATE TABLE IF NOT EXISTS admin_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(admin_user_id, school_id)
);

-- Create admin_school_assignments table if missing (alternative naming)
CREATE TABLE IF NOT EXISTS admin_school_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(admin_user_id, school_id)
);

-- Create pending_admin_invitations table if missing
CREATE TABLE IF NOT EXISTS pending_admin_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    invite_token TEXT NOT NULL UNIQUE,
    email_hash TEXT NOT NULL,
    temp_password TEXT NOT NULL,
    admin_level INTEGER NOT NULL DEFAULT 2,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id),
    signup_link TEXT
);

-- Add all necessary indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_admin_level ON admin_profiles(admin_level);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_user_id ON admin_permissions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_admin_user_id ON admin_assignments(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_school_id ON admin_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_admin_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_admin_invitations(email);

SELECT 'Tables and indexes created successfully!' as status;
