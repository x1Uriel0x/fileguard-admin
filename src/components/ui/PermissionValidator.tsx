import type { ReactNode } from 'react';

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

interface PermissionValidatorProps {
  children: ReactNode;
  userPermissions: Permission[];
  requiredPermission: Permission;
  fallback?: ReactNode;
  onAccessDenied?: () => void;
}

const PermissionValidator = ({
  children,
  userPermissions,
  requiredPermission,
  fallback = null,
  onAccessDenied,
}: PermissionValidatorProps) => {
  const hasPermission = () => {
    return userPermissions.some(
      (permission) =>
        permission.resource === requiredPermission.resource &&
        (permission.action === requiredPermission.action ||
          permission.action === 'admin')
    );
  };

  const hasAccess = hasPermission();

  if (!hasAccess) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionValidator;