import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploadZone from './components/FileUploadZone';
import FileListItem from './components/FileListItem';
import type { UploadedFile, FileMetadata } from "./types";
import FileList from "./components/FileList";


import { File as FileIcon, Upload as UploadIcon } from "lucide-react";

import Header from '../../components/ui/Header';

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
    loadMyFiles();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadMyFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('archivos')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    if (!userId) {
      alert('Por favor inicia sesión para subir archivos');
      return;
    }

    setIsUploading(true);

    for (const uploadedFile of filesToUpload) {
      const fileIndex = uploadedFiles.findIndex(f => f.file === uploadedFile.file);
      
      try {
        // Update status to uploading
        updateFileStatus(uploadedFile.file, { status: 'uploading', progress: 0 });

        // Generate unique file path
        const timestamp = Date.now();
        const fileName = `${timestamp}-${uploadedFile.file.name}`;
        const filePath = `${userId}/${fileName}`;

        // Simulate progress
        updateFileStatus(uploadedFile.file, { progress: 30 });

        // Upload to Supabase Storage (mis_archivos bucket)
        const { error: uploadError } = await supabase.storage
          .from('mis_archivos')
          .upload(filePath, uploadedFile.file);

        if (uploadError) throw uploadError;

        updateFileStatus(uploadedFile.file, { progress: 70 });

        // Save metadata to DatosNube table
        const { data: metadata, error: dbError } = await supabase
          .from('archivos')
          .insert({
            nombre: uploadedFile.file.name,
            path: filePath,
            owner_id: userId,
            permisos: { read: true, write: true, delete: true }
          })
          .select()
          .single();

        if (dbError) throw dbError;

        updateFileStatus(uploadedFile.file, { 
          status: 'success', 
          progress: 100,
          metadata 
        });

      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileStatus(uploadedFile.file, { 
          status: 'error', 
          error: error.message || 'Error al subir archivo'
        });
      }
    }

    setIsUploading(false);
    loadMyFiles();
  };

  const updateFileStatus = (file: File, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => 
      prev.map(f => f.file === file ? { ...f, ...updates } : f)
    );
  };

  const handleRemoveFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('mis_archivos')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      // Open in new tab for download
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Error al descargar el archivo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <UploadIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Subir Archivos</h2>
          </div>

          <FileUploadZone 
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Archivos en cola ({uploadedFiles.length})
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((uploadedFile, index) => (
                  <FileListItem
                    key={index}
                    uploadedFile={uploadedFile}
                    onRemove={() => handleRemoveFile(uploadedFile.file)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Files Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileIcon className="w-6 h-6 text-blue-600" />

            <h2 className="text-2xl font-bold text-gray-900">Mis Archivos</h2>
            <span className="ml-auto text-sm text-gray-500">
              {myFiles.length} archivo{myFiles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {myFiles.length === 0 ? (
            <div className="mt-10 bg-white rounded-xl p-6 border">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">Mis Archivos</h2>
  </div>

  <FileList />
</div>

          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myFiles.map((file) => (
                <div 
                  key={file.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => downloadFile(file.path, file.nombre)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FileIcon className="w-6 h-6 text-blue-600" />

                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(file.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;