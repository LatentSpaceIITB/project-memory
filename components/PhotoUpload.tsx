'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { validatePhoto } from '@/lib/validation';

interface PhotoUploadProps {
  onPhotoSelected: (file: File, previewUrl: string) => void;
  maxSizeMB?: number;
}

export default function PhotoUpload({ onPhotoSelected, maxSizeMB = 10 }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate the photo
    const validation = validatePhoto(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    onPhotoSelected(file, previewUrl);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create a Memory</h1>
          <p className="text-lg text-gray-600">Start by uploading a photo</p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-4 border-dashed rounded-3xl p-12 transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-[#FF6B6B] bg-[#FF6B6B]/5 scale-105'
              : 'border-gray-300 bg-white hover:border-[#FF6B6B] hover:bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {/* Upload Icon and Text */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
              isDragging ? 'bg-[#FF6B6B]' : 'bg-gray-100'
            }`}>
              <Upload size={40} className={isDragging ? 'text-white' : 'text-gray-400'} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isDragging ? 'Drop your photo here' : 'Drag & drop your photo'}
            </h3>
            <p className="text-gray-500 mb-6">or click to browse</p>

            <button
              type="button"
              className="bg-[#FF6B6B] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#FF5252] transition-all shadow-md hover:shadow-lg hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Choose Photo
            </button>

            <p className="text-sm text-gray-400 mt-6">
              Supports JPG and PNG • Max {maxSizeMB}MB
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Choose a meaningful photo that you want to preserve as a memory
          </p>
        </div>
      </div>
    </div>
  );
}
