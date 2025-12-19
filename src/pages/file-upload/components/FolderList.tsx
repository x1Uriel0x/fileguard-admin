import React from "react";
import { Folder, Trash2 } from "lucide-react";

interface FolderListProps {
  folders: any[];
  setCurrentFolder: (id: string | null) => void;
  setCurrentFolderName: (name: string) => void;
  onDelete: (id: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({ folders, setCurrentFolder, setCurrentFolderName, onDelete }) => {
  if (!folders || folders.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="p-4 bg-white border rounded-lg shadow hover:shadow-md transition relative"
        >
          {/* ELIMINAR CARPETA */}
          <button
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation(); // <-- evita abrir carpeta al borrar
              onDelete(folder.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* ABRIR CARPETA */}
            <div
              onClick={() => {
                setCurrentFolder(folder.id);
                setCurrentFolderName(folder.name); 
              }}
              className="flex flex-col items-center cursor-pointer"
            >
              <Folder className="w-10 h-10 text-blue-600" />
              <p className="mt-2 text-sm font-medium text-gray-800 truncate">
                {folder.name}
              </p>
            </div>
 
        </div>
      ))}
    </div>
  );
};

export default FolderList;
