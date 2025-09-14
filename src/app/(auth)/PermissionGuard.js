"use client";
import { usePermissions } from '../../contexts/PermissionsContext';

const PermissionGuard = ({ 
  permission = null,
  role = null,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  children 
}) => {
  const { 
    hasPermission, 
    hasRole, 
    hasAnyPermission, 
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    loading,
    isProcessingLogin 
  } = usePermissions();

  if (loading || isProcessingLogin) {
    return null; 
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return fallback;
    }
  }

  if (roles.length > 0) {
    const hasAccess = requireAll 
      ? hasAllRoles(roles)
      : hasAnyRole(roles);
    
    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
};

export default PermissionGuard;