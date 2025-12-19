import { useEffect } from "react";
import type { ReactNode } from "react";

import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
    const checkBannedUser = async () => {
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("banned")
            .eq("id", user.id)
            .single();

          if (profile?.banned) {
            await supabase.auth.signOut();
            alert("Tu cuenta ha sido baneada. Contacta al administrador.");
            navigate('/login', { replace: true });
            return;
          }
        }
      }
    };

    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isAuthenticated && !isPublicRoute) {
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname }
      });
    }

    if (isAuthenticated && isPublicRoute) {
      checkBannedUser();
    } else if (isAuthenticated && !isPublicRoute) {
      checkBannedUser();
    }
  }, [isAuthenticated, location.pathname, navigate, redirectTo, publicRoutes]);

  return <>{children}</>;
};

export default AuthenticationGuard;