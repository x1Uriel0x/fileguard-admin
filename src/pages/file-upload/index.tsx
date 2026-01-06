import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploadZone from './components/FileUploadZone';
import FileListItem from './components/FileListItem';
import FolderList from './components/FolderList';
import CreateFolderModal from './components/CreateFolderModal';
import FileList from './components/FileList';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { UploadedFile, FileMetadata } from "./types";
import type { Folder } from "./types";

import { Upload as UploadIcon } from "lucide-react";
import Header from '../../components/ui/Header';

interface Permission {
  userId: string;
  categoryId: string;
  access: {
    upload: boolean;
    edit?: boolean;
  };
}

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  /*const [role, setRole] = useState<"admin" | "user">("user");*/
  /*const [role, setRole] = useState<string>("user");*/
  const [role, setRole] = useState<"admin" | "user">("user");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [permissions] = useState<Permission[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  //  Carga inicial
  useEffect(() => {
  checkUser();
}, []);

useEffect(() => {
  if (!userId || !role) return;

  setIsLoading(true);
  /* loadUsers(); */      // admin → todos
  loadFolders();    // admin → todo
  loadMyFiles().then(() => setIsLoading(false));
}, [userId, role, currentFolder]);

useEffect(() => {
  const loadNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  };

  loadNotifications();
}, []);

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

 

  /*const hasUploadPermission = (folderId: string | null): boolean => {
  if (!folderId) return false;

  // Si es el dueño de la carpeta → puede subir
  const folder = folders.find((f) => f.id === folderId);
  if (folder && folder.owner_id === userId) {
    return true;
  }

  //  Si no es dueño → revisar permisos asignados
  const permission = permissions.find(
    (p: Permission) =>
      p.userId === userId &&
      p.categoryId === folderId &&
      p.access.upload === true
  );

  return !!permission;
};*/

const hasUploadPermission = async (folderId: string | null) => {
  // Root: siempre permitir
  if (!folderId) return true;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Traer rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") return true; // 👈 ADMIN SIEMPRE

  // Si no es admin, validar ownership
  const folder = folders.find(f => f.id === folderId);
  return folder?.owner_id === user.id;
};




  //  Subir archivos y asignar carpeta
 const uploadFiles = async (filesToUpload: UploadedFile[]) => {
  if (!userId) {
    alert("Por favor inicia sesión");
    return;
  }

  if (!(await hasUploadPermission(currentFolder))) {
    alert("No tienes permisos para subir archivos en esta carpeta");
    return;
  }

  setIsUploading(true);

  for (const uploadedFile of filesToUpload) {
    try {
      updateFileStatus(uploadedFile.file, { status: "uploading", progress: 0 });

      const timestamp = Date.now();
      const fileName = `${timestamp}-${uploadedFile.file.name}`;
      const filePath = `${currentFolder ?? "root"}/${userId}/${fileName}`;


      const { error: uploadError } = await supabase.storage
  .from("mis_archivos")
  .upload(filePath, uploadedFile.file, {
    metadata: {
      owner_id: userId,
      folder_id: currentFolder ?? null,
    },
  });


      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("archivos").insert({
        nombre: uploadedFile.file.name,
        path: filePath,
        owner_id: userId,
        folder_id: currentFolder,
      });

      if (dbError) throw dbError;

      // Insertar notificación para el propietario de la carpeta
      if (currentFolder) {
        const folder = folders.find(f => f.id === currentFolder);
        if (folder && folder.owner_id !== userId) {
          await supabase.from("notifications").insert({
            user_id: folder.owner_id,
            title: "Nuevo archivo",
            message: `Se ha subido un nuevo archivo "${uploadedFile.file.name}" a tu carpeta "${folder.name}"`,
            type: "info",
          });
        }
      }

      // 🔔 Notificar a los administradores
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: "Nuevo archivo subido",
          message: `El usuario subió el archivo "${uploadedFile.file.name}"`,
          type: "info",
        }));

        await supabase.from("notifications").insert(notifications);
      }

      updateFileStatus(uploadedFile.file, { status: "success", progress: 100 });

    } catch (err: any) {
      updateFileStatus(uploadedFile.file, {
        status: "error",
        error: err.message,
      });
    }
  }

  setIsUploading(false);
  await loadMyFiles();
};


//verifica los permisos actualaes y decide 
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

  if (data?.signedUrl) {
    const ext = nombre.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

    if (isImage) {
      // Descargar directamente para imágenes
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Abrir en nueva pestaña para otros archivos
      window.open(data.signedUrl, "_blank");
    }
  }
};


const deleteFolder = async (folderId: string) => {
  if (!confirm("¿Desea eliminar esta carpeta y todo su contenido?")) return;

  //  Obtener TODOS los archivos dentro de la carpeta
  const { data: files, error: filesError } = await supabase
    .from("archivos")
    .select("id, path")
    .eq("folder_id", folderId);

  if (filesError) {
    console.error(filesError);
    alert("Error obteniendo archivos");
    return;
  }

  //  Eliminar archivos del Storage
  if (files && files.length > 0) {
    const paths = files.map((f) => f.path);
    await supabase.storage.from("mis_archivos").remove(paths);

    // Eliminar archivos de la BD
    await supabase
      .from("archivos")
      .delete()
      .eq("folder_id", folderId);
  }

  //  Eliminar la carpeta
  const { error: folderError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (folderError) {
    console.error(folderError);
    alert("Error eliminando carpeta");
    return;
  }

  // Recargar vista
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

// Función para mover archivos entre carpetas
const moveFile = async (fileId: string, targetFolderId: string | null) => {
  const { error } = await supabase
    .from("archivos")
    .update({ folder_id: targetFolderId })
    .eq("id", fileId);

  if (error) {
    console.error("Error moviendo archivo:", error);
    alert("Error al mover el archivo");
    return;
  }

  // Recargar archivos
  await loadMyFiles();
};

// Handler para drag and drop
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over) return;

  const fileId = active.id as string;
  const targetFolderId = over.id === "root" ? null : over.id as string;

  moveFile(fileId, targetFolderId);
};



  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "5rem" }}>

      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <p className="text-lg text-gray-600">Cargando archivos...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Botón crear carpeta */}
        <CreateFolderModal
          parentId={currentFolder}
          userId={userId}
          onFolderCreated={loadFolders}
        />
      
        {/* Breadcrumb */}
          {currentFolder && (
        <div className="flex items-center gap-3 mb-4">
          <button
            className="text-sm text-blue-600"
            onClick={() => {
              setCurrentFolder(null);
              setCurrentFolderName(null);
            }}
          >
      ← Volver
    </button>

    <span className="text-sm text-gray-500">/</span>

    <span className="text-sm font-semibold text-gray-800">
      {currentFolderName}
    </span>
  </div>
        )}


        {/* Lista de carpetas */}
        <FolderList
          folders={folders}
          setCurrentFolder={setCurrentFolder}
           setCurrentFolderName={setCurrentFolderName}
          onDelete={deleteFolder}
        />

{/* Lista de archivos */}
        <FileList files={myFiles} onDownload={downloadFile} onDelete={deleteFile} />

        {/* Notificaciones */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Notificaciones
            </h2>
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                  <p className="text-gray-600">{notification.message}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
      )}

    </div>
  );
};

export default FileUpload;

