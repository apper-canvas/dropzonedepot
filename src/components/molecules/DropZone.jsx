import { useRef, useState, useCallback } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const DropZone = ({ 
  onFilesSelected, 
  maxFiles = 10, 
  acceptedTypes = [],
  disabled = false,
  className 
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);

    if (disabled) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      const limitedFiles = files.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
  }, [disabled, maxFiles, onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const limitedFiles = files.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [maxFiles, onFilesSelected]);

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-2xl transition-all duration-200 ease-out",
        "flex flex-col items-center justify-center p-8 min-h-[320px]",
        isDragOver 
          ? "border-primary bg-blue-50 scale-102 shadow-lg" 
          : "border-gray-300 hover:border-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="text-center space-y-6">
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-200",
          isDragOver 
            ? "bg-primary bg-opacity-10 text-primary scale-110" 
            : "bg-gradient-to-br from-blue-100 to-indigo-100 text-primary"
        )}>
          <ApperIcon 
            name={isDragOver ? "Download" : "Upload"} 
            className="w-10 h-10" 
          />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {isDragOver ? "Drop files here" : "Upload your files"}
          </h3>
          <p className="text-secondary text-sm max-w-md">
            {isDragOver 
              ? "Release to upload your files" 
              : "Drag and drop files here, or click browse to select files from your computer"
            }
          </p>
        </div>

        {/* Browse Button */}
        {!isDragOver && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleBrowseClick}
            disabled={disabled}
            className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="FolderOpen" className="w-5 h-5 mr-2" />
            Browse Files
          </Button>
        )}

        {/* File Limits Info */}
        <div className="text-xs text-secondary space-y-1 pt-2">
          <p>Maximum {maxFiles} files allowed</p>
          {acceptedTypes.length > 0 && (
            <p>Supported formats: {acceptedTypes.map(type => type.split("/")[1]).join(", ")}</p>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary bg-opacity-5 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default DropZone;