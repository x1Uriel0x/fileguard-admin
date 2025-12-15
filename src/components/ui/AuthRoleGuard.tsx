import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface AuthRoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "user")[];
}

export default function AuthRoleGuard({
  children,
  allowedRoles,
}: AuthRoleGuardProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // 1️⃣ Sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // 2️⃣ Rol real desde profiles
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile) {
        setAuthorized(false);
      } else {
        setAuthorized(allowedRoles.includes(profile.role));
      }

      setLoading(false);
    };

    checkAccess();
  }, [allowedRoles]);

  if (loading) return null;

  if (!authorized) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
