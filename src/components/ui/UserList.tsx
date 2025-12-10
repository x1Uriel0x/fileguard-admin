import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UserList() {
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setProfiles(data || []);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Usuarios</h3>
      <ul className="space-y-2">
        {profiles.map(p => (
          <li key={p.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
            <div>
              <div className="font-medium">{p.name || p.email}</div>
              <div className="text-xs text-muted-foreground">{p.email}</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="text-sm px-3 py-1 bg-primary text-white rounded" onClick={() => {
                // abrir modal de compartir / permisos con este usuario
                console.log("Compartir con", p.id);
              }}>
                Compartir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
