import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface ArchivoConUrl {
  id: string;
  nombre: string;
  path: string;
  owner_id: string;
  url?: string;
}

export default function FileList() {
  const [archivos, setArchivos] = useState<ArchivoConUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchivos = async () => {
    setLoading(true);

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Obtener registros de la tabla archivos
    const { data, error } = await supabase
      .from("archivos")
      .select("*")
      .eq("owner_id", user.id);

    if (error) {
      console.error("Error al cargar archivos:", error.message);
      setLoading(false);
      return;
    }

    // Generar URLs firmadas para cada archivo
    const archivosConUrl = await Promise.all(
      data.map(async (file) => {
        const { data: signed } = await supabase.storage
          .from("mis_archivos")
          .createSignedUrl(file.path, 3600); // 1 hora

        return {
          ...file,
          url: signed?.signedUrl,
        };
      })
    );

    setArchivos(archivosConUrl);
    setLoading(false);
  };

  const eliminarArchivo = async (file: ArchivoConUrl) => {
    const confirmar = confirm(
      `¿Eliminar archivo "${file.nombre}" permanentemente?`
    );

    if (!confirmar) return;

    // 1. eliminar de storage
    await supabase.storage.from("mis_archivos").remove([file.path]);

    // 2. eliminar de la tabla
    await supabase.from("archivos").delete().eq("id", file.id);

    // 3. refrescar lista
    fetchArchivos();
  };

  useEffect(() => {
    fetchArchivos();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Cargando archivos...</p>;
  }

  if (archivos.length === 0) {
    return <p className="text-muted-foreground">Aún no has subido archivos.</p>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Mis archivos</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {archivos.map((file: ArchivoConUrl) => (
          <div
            key={file.id}
            className="bg-white border rounded-xl shadow p-3 space-y-3"
          >
            <img
              src={file.url}
              alt={file.nombre}
              className="w-full h-32 object-cover rounded"
            />

            <p className="text-sm font-medium truncate">{file.nombre}</p>

            <div className="flex justify-between text-sm">
              <a
                href={file.url}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Descargar
              </a>

              <button
                onClick={() => eliminarArchivo(file)}
                className="text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
