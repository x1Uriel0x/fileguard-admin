import React from 'react';
import { File, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import type { UploadedFile } from '../types';

interface FileListItemProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ uploadedFile, onRemove }) => {
  const { file, progress, status, error } = uploadedFile;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Subido exitosamente';
      case 'error':
        return error || 'Error al subir';
      case 'uploading':
        return `Subiendo... ${progress}%`;
      default:
        return 'Esperando';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(file.size / 1024).toFixed(2)} KB
        </p>
        <p className={`text-xs mt-1 ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {getStatusText()}
        </p>
      </div>

      {status === 'uploading' && (
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={onRemove}
        disabled={status === 'uploading'}
        className={`
          flex-shrink-0 p-2 rounded-full transition-colors
          ${status === 'uploading' ?'opacity-50 cursor-not-allowed' :'hover:bg-gray-100 active:bg-gray-200'
          }
        `}
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default FileListItem;