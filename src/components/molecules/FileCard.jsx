import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/molecules/ProgressBar";
import fileUploadService from "@/services/api/fileUploadService";
import { cn } from "@/utils/cn";

const FileCard = ({ 
  file, 
  onRemove, 
  onUploadComplete,
  onUploadError,
  className 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="default">Pending</Badge>;
      case "uploading":
        return <Badge variant="primary">Uploading</Badge>;
      case "complete":
        return <Badge variant="success">Complete</Badge>;
      case "error":
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const handleUpload = async () => {
    if (file.status !== "pending") return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await fileUploadService.updateUpload(file.Id, { status: "uploading", progress: 0 });
      
      const updatedFile = await fileUploadService.simulateUpload(file.Id, (progress) => {
        setUploadProgress(progress);
      });

      if (updatedFile && onUploadComplete) {
        onUploadComplete(updatedFile);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      await fileUploadService.updateUpload(file.Id, { 
        status: "error", 
        errorMessage: "Upload failed. Please try again." 
      });
      
      if (onUploadError) {
        onUploadError(file.Id, "Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async () => {
    await fileUploadService.updateUpload(file.Id, { 
      status: "pending", 
      progress: 0, 
      errorMessage: "" 
    });
    handleUpload();
  };

  return (
    <Card className={cn("p-4", className)} hover>
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
          <ApperIcon 
            name={fileUploadService.getFileIcon(file.type)} 
            className="w-6 h-6 text-primary" 
          />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-secondary">
                {fileUploadService.formatFileSize(file.size)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(file.status)}
              
              {file.status === "pending" && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.Id)}
                  className="p-1 h-6 w-6 text-gray-400 hover:text-error"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(file.status === "uploading" || isUploading) && (
            <ProgressBar 
              progress={uploadProgress || file.progress || 0}
              animated={true}
              showPercentage={false}
            />
          )}

          {/* Error Message */}
          {file.status === "error" && file.errorMessage && (
            <div className="text-xs text-error bg-red-50 p-2 rounded-lg">
              {file.errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {file.status === "pending" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="text-xs"
              >
                <ApperIcon name="Upload" className="w-3 h-3 mr-1" />
                Upload
              </Button>
            )}

            {file.status === "error" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isUploading}
                className="text-xs"
              >
                <ApperIcon name="RotateCcw" className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}

            {file.status === "complete" && file.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(file.url, "_blank")}
                className="text-xs text-success hover:text-green-700"
              >
                <ApperIcon name="ExternalLink" className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileCard;