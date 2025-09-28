"use client";
import { usePermissions } from '../../contexts/PermissionsContext';

const PermissionGuard = ({ 
  permission = null,
  permissions = [],
  requireAll = false,
  fallback = null,
  children 
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    loading,
    isProcessingLogin 
  } = usePermissions();

  if (loading || isProcessingLogin) {
    return null; 
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

  return children;
};

export default PermissionGuard;