import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Mi Perfil</h1>

      <div className="bg-white shadow border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Nombre</p>
          <p className="font-medium">{user.user_metadata?.name || "Sin nombre"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Correo electrónico</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Rol</p>
          <p className="font-medium capitalize">
            {user.user_metadata?.role || "sin rol"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">ID del usuario</p>
          <p className="font-mono text-xs">{user.id}</p>
        </div>
      </div>
    </div>
  );
}
