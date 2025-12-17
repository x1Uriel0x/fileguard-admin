import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploadZone from './components/FileUploadZone';
import FileListItem from './components/FileListItem';
import FolderList from './components/FolderList';
import CreateFolderModal from './components/CreateFolderModal';
import FileList from './components/FileList';

import type { UploadedFile, FileMetadata } from "./types";
import type { Folder } from "./types";

import { Upload as UploadIcon, Folder as FolderIcon } from "lucide-react";
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
  if (!userId || !role) return;

  /* loadUsers(); */      // admin → todos
  loadFolders();    // admin → todo
  loadMyFiles();
}, [userId, role, currentFolder]);

  const init = async () => {
    await checkUser();      
    await loadFolders();
    await loadMyFiles();
  };  

  // Obtener usuario
 const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return;

  setUserId(user.id);
  setRole(profile.role);

  console.log("checkUser → userId:", user?.id);
console.log("checkUser → role:", profile?.role);



};

  // Cargar carpetas dentro de currentFolder
const loadFolders = async () => {
  if (!userId || !role) return;

  //  ADMIN → ve todas
  if (role === "admin") {
    let query = supabase.from("folders").select("*");

    if (currentFolder) {
      query = query.eq("parent_id", currentFolder);
    } else {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;
    if (!error) setFolders(data ?? []);
    return;
  }

  //  USUARIO NORMAL
  //  Carpetas propias
  let ownQuery = supabase
    .from("folders")
    .select("*")
    .eq("owner_id", userId);

  if (currentFolder) {
    ownQuery = ownQuery.eq("parent_id", currentFolder);
  } else {
    ownQuery = ownQuery.is("parent_id", null);
  }

  const { data: ownFolders } = await ownQuery;

  //Carpetas compartidas
  let sharedQuery = supabase
    .from("folder_permissions")
    .select("folders(*)")
    .eq("user_id", userId)
    .eq("can_view", true);

  if (currentFolder) {
    sharedQuery = sharedQuery.eq("folders.parent_id", currentFolder);
  } else {
    sharedQuery = sharedQuery.is("folders.parent_id", null);
  }

  const { data: sharedData } = await sharedQuery;
  const sharedFolders = sharedData?.map((r: any) => r.folders) ?? [];

  // Unir y evita duplicados
  const allFolders = [...(ownFolders ?? []), ...sharedFolders];
  const unique = Array.from(
    new Map(allFolders.map(f => [f.id, f])).values()
  );

  setFolders(unique);
};





const deleteFile = async (file: FileMetadata) => {
  if (!confirm(`¿Eliminar "${file.nombre}"?`)) return;

  //  borrar del storage
  const { error: storageError } = await supabase.storage
    .from("mis_archivos")
    .remove([file.path]);

  console.log("STORAGE ERROR:", storageError);

  if (storageError) {
    alert("Error en storage");
    return;
  }

  //borrar de la BD
  const { error: dbError } = await supabase
    .from("archivos")
    .delete()
    .eq("id", file.id);

  console.log("DB ERROR:", dbError);

  if (dbError) {
    alert(dbError.message);
    return;
  }

  await loadMyFiles();
};

  //Cargar archivos dentro de currentFolder
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
    setRole(data.role); 
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

        // Subir archivo físicamente
        const { error: uploadError } = await supabase.storage
          .from('mis_archivos')
          .upload(filePath, uploadedFile.file);

        if (uploadError) throw uploadError;

        updateFileStatus(uploadedFile.file, { progress: 70 });

        // Guardar metadatos y carpeta asignada
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
  if (!confirm("¿Eliminar carpeta y todo su contenido?")) return;

  //  Obtener archivos dentro de la carpeta
  const { data: files, error: filesError } = await supabase
    .from("archivos")
    .select("id, path")
    .eq("folder_id", folderId);

  if (filesError) {
    alert("Error obteniendo archivos");
    return;
  }

  // Borrar archivos del storage
  if (files && files.length > 0) {
    const paths = files.map(f => f.path);

    const { error: storageError } = await supabase.storage
      .from("mis_archivos")
      .remove(paths);

    if (storageError) {
      alert("Error borrando archivos del storage");
      return;
    }

    // Borrar archivos de la BD
    const { error: dbFilesError } = await supabase
      .from("archivos")
      .delete()
      .eq("folder_id", folderId);

    if (dbFilesError) {
      alert("Error borrando archivos de la base");
      return;
    }
  }

  // Borrar carpeta
  const { error: folderError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (folderError) {
    alert("Error borrando carpeta");
    return;
  }

  // Refrescar UI
  await loadFolders();
  await loadMyFiles();
};

const confirmDeleteFolder = async (folderId: string) => {
  const ok = window.confirm(
    "Esta carpeta contiene archivos y subcarpetas.\n" +
    "¿Seguro que deseas eliminarla junto con todo su contenido?"
  );

  if (!ok) return;

  await deleteFolder(folderId);
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
        <FolderList
          folders={folders}
          setCurrentFolder={setCurrentFolder}
          onDelete={deleteFolder}
        />

{/* Lista de archivos */}
        <FileList files={myFiles} onDownload={downloadFile} onDelete={deleteFile} />
      </div>

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

        
    </div>
  );
};

export default FileUpload;

