import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface CreateFolderModalProps {
  userId: string | null;    // 👈 Aceptamos null
  parentId: string | null;
  onFolderCreated: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  userId,
  parentId,
  onFolderCreated
}) => {
  const [name, setName] = useState("");

  const create = async () => {
    if (!userId) {
      console.error("No se puede crear carpeta sin usuario.");
      return;
    }

    if (!name.trim()) {
      alert("El nombre de la carpeta no puede estar vacío.");
      return;
    }

    const { error } = await supabase.from("folders").insert({
      name,
      parent_id: parentId,
      owner_id: userId, // 👈 Ahora seguro
    });

    if (error) {
      console.error(error);
      alert("Error al crear carpeta");
      return;
    }

    setName("");
    onFolderCreated();
  };

  return (
    <div className="mb-4 flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
        placeholder="Nombre de carpeta"
      />

      <button
        onClick={create}
        disabled={!userId} // 👈 Si no hay usuario, no deja
        className={`px-4 py-2 rounded text-white 
          ${userId ? "bg-primary" : "bg-gray-400 cursor-not-allowed"}
        `}
      >
        Crear
      </button>
    </div>
  );
};

export default CreateFolderModal;
