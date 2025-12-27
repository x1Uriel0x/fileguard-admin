import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        // Fetch profile data including avatar_url
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        setUser({
          ...authData.user,
          user_metadata: {
            ...authData.user.user_metadata,
            avatar_url: profile?.avatar_url || authData.user.user_metadata?.avatar_url,
          },
        });
      }
    };
    fetchUser();
  }, []);

const uploadAvatar = async (file: File) => {
  if (!user) return;

  setAvatarUploading(true);

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}.${ext}`;

  // 1. Subir a Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type
    });

  if (uploadError) {
    alert("Error subiendo avatar");
    setAvatarUploading(false);
    return;
  }

  // 2. Obtener URL pública
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // 3. Guardar en profiles
  await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", user.id);

  // 4. Actualizar estado local
  setUser({
    ...user,
    user_metadata: {
      ...user.user_metadata,
      avatar_url: data.publicUrl,
    },
  });

  setAvatarUploading(false);
};


  if (!user) return <p className="p-6">Cargando...</p>;

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center h-full text-gray-500">
              Sin foto
            </span>
          )}
        </div>

        <label className="text-sm text-blue-600 cursor-pointer">
          {avatarUploading ? "Subiendo..." : "Cambiar foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={avatarUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          />
        </label>
      </div>

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
    </div>
  );
}


