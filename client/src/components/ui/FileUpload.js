import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUpload = ({ 
  onFileSelect, 
  accept = '.csv,.xlsx,.xls',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError('');
    
    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return false;
    }
    
    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Only ${acceptedTypes.join(', ')} files are allowed`);
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragging && !disabled && 'border-primary-500 bg-primary-50 dark:bg-primary-900/10',
          !isDragging && !disabled && 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700',
          error && 'border-red-500'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-4">
            <DocumentArrowUpIcon className="h-10 w-10 text-primary-600" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Remove file"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {accept.split(',').join(', ').toUpperCase()} up to {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
