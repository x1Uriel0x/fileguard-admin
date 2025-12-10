import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

import { useNavigate } from "react-router-dom"; 

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();     

  /* ====================================================
      CARGAR DATOS DEL USUARIO AL ENTRAR
  ===================================================== */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      setName(u?.user_metadata?.name || "");
      setAvatar(u?.user_metadata?.avatar_url || "");
    });
  }, []);

  /* ====================================================
          ACTUALIZAR NOMBRE & AVATAR
  ===================================================== */
  const handleSaveProfile = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        name,
        avatar_url: avatar,
      },
    });

    setLoading(false);

    if (error) {
      alert("Error al actualizar perfil: " + error.message);
    } else {
      alert("Perfil actualizado correctamente");
    }
  };

  /* ====================================================
               CAMBIAR CONTRASEÑA
  ===================================================== */
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("Completa todos los campos.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    // 1. Re-logear para validar contraseña actual
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (loginError) {
      alert("La contraseña actual es incorrecta.");
      setLoading(false);
      return;
    }

    // 2. Cambiar la contraseña
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      alert("Error al cambiar contraseña: " + error.message);
    } else {
      alert("Contraseña actualizada correctamente");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      navigate(-1);
    }
  };
  
  if (!user) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Configuración</h1>

      {/* PERFIL */}
      <div className="bg-white shadow border rounded-xl p-6 space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Datos del Perfil</h2>

        <div>
          <label className="text-sm text-gray-500">Nombre</label>
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">URL del Avatar</label>
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-primary text-white py-2 rounded-lg"
          onClick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Perfil"}
        </button>
      </div>

      {/* CONTRASEÑA */}
      <div className="bg-white shadow border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>

        <div>
          <label className="text-sm text-gray-500">Contraseña Actual</label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              className="w-full border rounded p-2 mt-1 pr-10"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showOldPassword ?  (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
          )}
                      </button>
          </div>
        </div>


        <div>
          <label className="text-sm text-gray-500">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full border rounded p-2 mt-1 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showNewPassword ? (
    <EyeOff size={18} />
  ) : (
    <Eye size={18} />
)}
            </button>
          </div>
      </div>


        <div>
  <label className="text-sm text-gray-500">Confirmar Nueva Contraseña</label>

  <div className="relative">
    <input
      type={showConfirmNewPassword ? "text" : "password"}
      className="w-full border rounded p-2 mt-1 pr-10"
      value={confirmNewPassword}
      onChange={(e) => setConfirmNewPassword(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
    >
      {showConfirmNewPassword ?  (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />   
    )}
    </button>
  </div>
</div>

<button
  className="w-full bg-primary text-white py-2 rounded-lg mt-4"
  onClick={handleChangePassword}
  disabled={loading}
>
  {loading ? "Procesando..." : "Cambiar Contraseña"}
</button>

      </div>
    </div>
  );
}
