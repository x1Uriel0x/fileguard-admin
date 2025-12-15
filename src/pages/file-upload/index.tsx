import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploadZone from './components/FileUploadZone';
import FileListItem from './components/FileListItem';
import FolderList from './components/FolderList';
import CreateFolderModal from './components/CreateFolderModal';
import FileList from './components/FileList';

import type { UploadedFile, FileMetadata } from "./types";
import type { Folder } from "./types";

import { File as FileIcon, Upload as UploadIcon, Folder as FolderIcon } from "lucide-react";
import Header from '../../components/ui/Header';


const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  /*const [role, setRole] = useState<"admin" | "user">("user");*/
  /*const [role, setRole] = useState<string>("user");*/
  const [role, setRole] = useState<"admin" | "user">("user");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //  Carga inicial
  useEffect(() => {
  checkUser();
}, []);

useEffect(() => {
  if (userId) {
    loadFolders();
    loadMyFiles();
  }
}, [userId, currentFolder]);

  const init = async () => {
    await checkUser();
    await loadFolders();
    await loadMyFiles();
  };

  // Obtener usuario
  const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  setUserId(user.id);
  loadUserRole(user.id);
  await loadUserRole(user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile) {
    setRole(profile.role);
  }
};


  // ⬇ Cargar carpetas dentro de currentFolder
  const   loadFolders = async () => {
  if (!userId) return;

  let query = supabase.from("folders").select("*");

  if (role !== "admin") {
    query = query.eq("owner_id", userId);
  }

  if (currentFolder) {
    query = query.eq("parent_id", currentFolder);
  } else {
    query = query.is("parent_id", null);
  }

  const { data, error } = await query;

  if (!error) setFolders(data || []);
};




  // ⬇ Cargar archivos dentro de currentFolder
  const loadMyFiles = async () => {
  if (!userId) return;

  let query = supabase
  .from("archivos")
  .select("*")
  .order("created_at", { ascending: false });

if (role !== "admin") {
  query = query.eq("owner_id", userId);
}

if (currentFolder) {
  query = query.eq("folder_id", currentFolder);
} else {
  query = query.is("folder_id", null);
}


  const { data, error } = await query;

  if (error) {
    console.error(" Error cargando archivos:", error);
    return;
  }

  setMyFiles(data || []);
};


const loadUserRole = async (uid: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", uid)
    .single();

  if (!error && data) {
    console.log("Rol detectado:", data.role);
    setRole(data.role); // ← AQUI SE ESTABLECE
  }
};


  // Maneja archivos seleccionados
  const handleFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  //  Subir archivos y asignar carpeta
  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    if (!userId) {
      alert('Por favor inicia sesión para subir archivos');
      return;
    }

    setIsUploading(true);

    for (const uploadedFile of filesToUpload) {
      try {
        updateFileStatus(uploadedFile.file, { status: 'uploading', progress: 0 });

        const timestamp = Date.now();
        const fileName = `${timestamp}-${uploadedFile.file.name}`;
        const filePath = `${userId}/${fileName}`;

        updateFileStatus(uploadedFile.file, { progress: 30 });

        // ⬇️ Subir archivo físicamente
        const { error: uploadError } = await supabase.storage
          .from('mis_archivos')
          .upload(filePath, uploadedFile.file);

        if (uploadError) throw uploadError;

        updateFileStatus(uploadedFile.file, { progress: 70 });

        // ⬇️ Guardar metadatos y carpeta asignada
        const { data: metadata, error: dbError } = await supabase
      .from('archivos')
      .insert({
        nombre: uploadedFile.file.name,
        path: filePath,
        owner_id: userId,
        folder_id: currentFolder ?? null,  //  ARREGLO REAL
        permisos: { read: true, write: true, delete: true }
      })
      .select()
      .single();
console.log(" Archivo guardado en BD:", metadata);


        if (dbError) throw dbError;

        updateFileStatus(uploadedFile.file, {
          status: 'success',
          progress: 100,
          metadata
        });

      } catch (error: any) {
        updateFileStatus(uploadedFile.file, {
          status: 'error',
          error: error.message || 'Error al subir archivo'
        });
      }
    }

    setIsUploading(false);
    await loadMyFiles();
  };

  const updateFileStatus = (file: File, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev =>
      prev.map(f => f.file === file ? { ...f, ...updates } : f)
    );
  };

  const handleRemoveFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  const downloadFile = async (filePath: string, nombre: string) => {
  const { data } = await supabase.storage
    .from("mis_archivos")
    .createSignedUrl(filePath, 3600);

  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
};

const deleteFolder = async (folderId: string) => {
  if (!confirm("¿Desea eliminar esta carpeta y todos sus archivos?")) return;

  // 1. Traer archivos dentro de esta carpeta
  const { data: files } = await supabase
    .from("archivos")
    .select("path")
    .eq("folder_id", folderId);

  // 2. Eliminar archivos del bucket Storage
  if (files && files.length > 0) {
    const filePaths = files.map((f) => f.path);
    await supabase.storage.from("mis_archivos").remove(filePaths);
  }

  // 3. Eliminar carpeta (y subcarpetas si usás cascada)
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    alert("Error eliminando carpeta");
    return;
  }

  // 4. Recargar carpetas
  await loadFolders();
};

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "5rem" }}>

      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Botón crear carpeta */}
        <CreateFolderModal
          parentId={currentFolder}
          userId={userId}
          onFolderCreated={loadFolders}
        />

        {/* Breadcrumb */}
        {currentFolder && (
          <button
            className="text-sm mb-4 text-blue-600"
            onClick={() => setCurrentFolder(null)}
          >
            ← Volver
          </button>
        )}

        {/* Lista de carpetas */}
        {/* Lista de carpetas */}
        <FolderList
          folders={folders}
          setCurrentFolder={setCurrentFolder}
          onDelete={deleteFolder}
        />


        {/* Subir archivos */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <UploadIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Subir Archivos
            </h2>
          </div>

          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Archivos en cola
              </h3>

              {uploadedFiles.map((uploadedFile, index) => (
                <FileListItem
                  key={index}
                  uploadedFile={uploadedFile}
                  onRemove={() => handleRemoveFile(uploadedFile.file)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lista de archivos */}
        <FileList files={myFiles} onDownload={downloadFile} />
      </div>
    </div>
  );
};

export default FileUpload;
