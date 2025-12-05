import { useEffect } from "react";
import type { ReactNode } from "react";

import { useNavigate, useLocation } from 'react-router-dom';

interface AuthenticationGuardProps {
  children: ReactNode;
  isAuthenticated: boolean;
  redirectTo?: string;
  publicRoutes?: string[];
}

const AuthenticationGuard = ({
  children,
  isAuthenticated,
  redirectTo = '/login',
  publicRoutes = ['/login', '/register'],
}: AuthenticationGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isAuthenticated && !isPublicRoute) {
      navigate(redirectTo, { 
        replace: true,
        state: { from: location.pathname }
      });
    }

    if (isAuthenticated && isPublicRoute) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, redirectTo, publicRoutes]);

  return <>{children}</>;
};

export default AuthenticationGuard;