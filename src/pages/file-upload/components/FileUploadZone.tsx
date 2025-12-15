console.log("⚡ FILEUPLOADZONE RENDERIZANDO");

import React, { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const openFileDialog = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onClick={openFileDialog}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center transition-all
        select-none
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        disabled={disabled}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className="p-4 bg-blue-100 rounded-full">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>

        <p className="text-lg font-semibold text-gray-700">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Soporta múltiples archivos (máx. 5MB por archivo)
        </p>
      </div>
    </div>
  );
};

export default FileUploadZone;
