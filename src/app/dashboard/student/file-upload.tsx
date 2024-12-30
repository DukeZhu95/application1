import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
          <Upload className="w-4 h-4" />
          <span>Select File</span>
        </label>
      </div>
      {selectedFile && (
        <div className="text-sm text-gray-600">
          Selected file: {selectedFile.name}
        </div>
      )}
    </div>
  );
}
