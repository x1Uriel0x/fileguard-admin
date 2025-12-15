import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface AuthRoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthRoleGuard({ children, allowedRoles = [] }: AuthRoleGuardProps) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session || null;
      setSession(currentSession);

      if (currentSession?.user?.id) {
        // 🔥 Cargar el rol REAL desde profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentSession.user.id)
          .single();

        setRole(profile?.role || "user");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return <p>Cargando...</p>;

  // ❌ No autenticado
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 🔥 Usar el rol REAL desde la DB
  const finalRole = role ?? "user";

  //  No tiene permiso
  if (allowedRoles.length > 0 && !allowedRoles.includes(finalRole)) {
    if (location.pathname !== "/file-upload") {
      return <Navigate to="/file-upload" replace />;
    }
  }

  // ✔ Autenticado y permitido
  return <>{children}</>;
}
