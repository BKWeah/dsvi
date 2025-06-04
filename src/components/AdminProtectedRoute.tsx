import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/lib/admin/useAdmin';
import { PermissionType } from '@/lib/admin/permissions';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionType | string;
  resourceId?: string; // For school-specific permissions
  requireLevel1?: boolean; // Require Level 1 admin specifically
  allowedRoles?: string[]; // For backward compatibility with existing roles
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  resourceId,
  requireLevel1 = false,
  allowedRoles = []
}) => {
  const { user, role, loading: authLoading } = useAuth();
  const { adminLevel, hasPermission, isLevel1Admin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has basic role access (backward compatibility)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // For DSVI admin routes with enhanced protection
  if (role === 'DSVI_ADMIN') {
    // If Level 1 admin is specifically required and user is not Level 1
    if (requireLevel1 && adminLevel !== null && !isLevel1Admin) {
      return <Navigate to="/unauthorized" replace />;
    }

    // If specific permission is required and user doesn't have it
    if (requiredPermission && adminLevel !== null && !hasPermission(requiredPermission, resourceId)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // For existing DSVI admins who don't have admin levels yet (backward compatibility)
    // Allow access if no specific requirements are set
    if (adminLevel === null && !requireLevel1 && !requiredPermission) {
      return <>{children}</>;
    }

    // If admin level exists, allow access
    if (adminLevel !== null) {
      return <>{children}</>;
    }

    // If we reach here and it's a DSVI admin without admin level but with specific requirements,
    // treat as Level 1 for backward compatibility during transition period
    if (adminLevel === null && role === 'DSVI_ADMIN') {
      return <>{children}</>;
    }
  }

  return <>{children}</>;
};

// Enhanced version of the original ProtectedRoute for backward compatibility
interface EnhancedProtectedRouteProps {
  children: React.ReactNode;
  roles: string[];
  requiredPermission?: PermissionType | string;
  resourceId?: string;
  requireLevel1?: boolean;
}

export const EnhancedProtectedRoute: React.FC<EnhancedProtectedRouteProps> = ({ 
  children, 
  roles,
  requiredPermission,
  resourceId,
  requireLevel1 = false
}) => {
  return (
    <AdminProtectedRoute
      allowedRoles={roles}
      requiredPermission={requiredPermission}
      resourceId={resourceId}
      requireLevel1={requireLevel1}
    >
      {children}
    </AdminProtectedRoute>
  );
};
