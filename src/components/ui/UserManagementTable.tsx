import { supabase } from "../../lib/supabase";

async function updateUserRole(userId: string, newRole: "admin" | "user") {
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    alert("Error al actualizar rol: " + error.message);
    return false;
  }

  return true;
}

