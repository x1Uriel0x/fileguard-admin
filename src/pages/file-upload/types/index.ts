export interface FileMetadata {
  id: string;
  nombre: string;
  path: string;
  owner_id: string;
  created_at: string;
  permisos?: any;
}

export interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  metadata?: FileMetadata;
}