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

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return <p>Cargando...</p>;

  // ❌ No autenticado → enviar a login
  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  const role = session.user.user_metadata?.role;

  //  Usuario sin permiso → solo redirigimos si NO está en file-upload
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (location.pathname !== "/file-upload") {
      return <Navigate to="/file-upload" replace />;
    }
  }

  // ✔ Autenticado y con permiso
  return <>{children}</>;
}
