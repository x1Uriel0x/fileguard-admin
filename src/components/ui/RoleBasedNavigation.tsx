import type { ReactNode } from 'react';

interface RoleBasedNavigationProps {
  userRole: 'admin' | 'user' | 'guest';
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: ReactNode;
}

const RoleBasedNavigation = ({
  userRole,
  children,
  requiredRole,
  fallback = null,
}: RoleBasedNavigationProps) => {
  const hasAccess = () => {
    if (!requiredRole) return true;
    
    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }
    
    if (requiredRole === 'user') {
      return userRole === 'admin' || userRole === 'user';
    }
    
    return false;
  };

  if (!hasAccess()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedNavigation;