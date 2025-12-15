import React, { useEffect, useState } from "react";
import {
  FileImage,
  FileText,
  FileArchive,
  FileVideo,
  File,
  AlertTriangle
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import type { FileMetadata } from "../types";

interface FileListProps {
  files: FileMetadata[];
  onDownload: (filePath: string, nombre: string) => void;
  onDelete: (file: FileMetadata) => void; 
}

const getFileTypeIcon = (ext: string) => {
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
    return <FileImage className="w-8 h-8 text-blue-600" />;

  if (["pdf"].includes(ext))
    return <FileText className="w-8 h-8 text-red-600" />;

  if (["zip", "rar", "7z"].includes(ext))
    return <FileArchive className="w-8 h-8 text-yellow-600" />;

  if (["mp4", "mov", "webm"].includes(ext))
    return <FileVideo className="w-8 h-8 text-purple-600" />;

  return <File className="w-8 h-8 text-gray-600" />;
};

const FileList: React.FC<FileListProps> = ({ files, onDownload, onDelete }) => {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPreviews = async () => {
      const newPreviews: Record<string, string> = {};

      for (const file of files) {
        if (!file.path) continue; // evita error

        const ext = file.nombre.split(".").pop()?.toLowerCase() || "";

        if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
          const { data, error } = await supabase.storage
            .from("mis_archivos")
            .createSignedUrl(file.path, 3600);

          if (data?.signedUrl) newPreviews[file.id] = data.signedUrl;
          if (error) console.warn("Error cargando preview:", error);
        }
      }

      setPreviews(newPreviews);
    };

    loadPreviews();
  }, [files]);

  if (!files || files.length === 0)
    return <p className="text-muted-foreground mt-4">No hay archivos en esta carpeta.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {files.map((file) => {
        const ext = file.nombre.split(".").pop()?.toLowerCase() || "";
        const previewUrl = previews[file.id];

        return (
          <div
            key={file.id}
            className="border rounded-lg p-4 bg-white hover:shadow-md cursor-pointer transition"
            onClick={() => {
              if (!file.path) {
                alert("Este archivo tiene un path inválido en la base de datos.");
                return;
              }
              onDownload(file.path, file.nombre);
            }}
          >
            <div className="flex justify-between items-center mt-3">
  <button
  onClick={(e) => {
    e.stopPropagation();
    onDownload(file.path, file.nombre);
  }}
  className="text-sm text-blue-600 hover:underline"
>
  Descargar
</button>


  <button
  className="text-red-600 hover:text-red-800"
  onClick={(e) => {
    e.stopPropagation();          // 🔥 CLAVE
    onDelete(file);
  }}
>
  eliminar
</button>


</div>

   <div className="flex items-center gap-3">
      {/* Preview o icono */}
        {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.nombre}
              className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  {file.path ? getFileTypeIcon(ext) : <AlertTriangle className="text-red-500" />}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{file.nombre}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(file.created_at).toLocaleDateString("es-ES")}
                </p>

                {!file.path && (
                  <p className="text-xs text-red-600 mt-1">Path inválido</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileList;
