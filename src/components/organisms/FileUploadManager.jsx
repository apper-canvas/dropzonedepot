import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ApperFileFieldComponent from "@/components/atoms/ApperFileFieldComponent";
import { useAuth } from "@/layouts/Root";
import { toast } from "react-toastify";
import fileUploadService from "@/services/api/fileUploadService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import DropZone from "@/components/molecules/DropZone";
import FileCard from "@/components/molecules/FileCard";

const FileUploadManager = () => {
  const [files, setFiles] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingAll, setUploadingAll] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [uploadConfig, existingUploads] = await Promise.all([
        fileUploadService.getConfig(),
        fileUploadService.getAllUploads()
      ]);
      
      setConfig(uploadConfig);
      setFiles(existingUploads);
    } catch (err) {
      setError("Failed to load upload configuration");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = async (selectedFiles) => {
    if (!config) return;

    // Validate each file
    const validFiles = [];
    const errors = [];

    for (const file of selectedFiles) {
      const fileErrors = fileUploadService.validateFile(file);
      if (fileErrors.length > 0) {
        errors.push(`${file.name}: ${fileErrors.join(", ")}`);
      } else {
        validFiles.push(file);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast.error(`File validation failed:\n${errors.join("\n")}`);
    }

    // Check total file limit
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > config.maxFiles) {
      toast.error(`Maximum ${config.maxFiles} files allowed. Please remove some files first.`);
      return;
    }

    // Create upload records for valid files
    if (validFiles.length > 0) {
      try {
        const newUploads = await Promise.all(
          validFiles.map(file => fileUploadService.createUpload(file))
        );
        
        setFiles(prev => [...prev, ...newUploads]);
        toast.success(`${validFiles.length} file(s) added successfully`);
      } catch (err) {
        toast.error("Failed to add files");
        console.error("File creation error:", err);
      }
    }
  };

  const handleFileRemove = async (fileId) => {
    try {
      await fileUploadService.deleteUpload(fileId);
      setFiles(prev => prev.filter(file => file.Id !== fileId));
      toast.success("File removed");
    } catch (err) {
      toast.error("Failed to remove file");
      console.error("File removal error:", err);
    }
  };

  const handleUploadComplete = (updatedFile) => {
    setFiles(prev => prev.map(file => 
      file.Id === updatedFile.Id ? updatedFile : file
    ));
    toast.success(`${updatedFile.name} uploaded successfully`);
  };

  const handleUploadError = (fileId, errorMessage) => {
    setFiles(prev => prev.map(file => 
      file.Id === fileId 
        ? { ...file, status: "error", errorMessage }
        : file
    ));
    toast.error("Upload failed");
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(file => file.status === "pending");
    if (pendingFiles.length === 0) {
      toast.info("No files to upload");
      return;
    }

    setUploadingAll(true);

    try {
      // Upload all pending files sequentially
      for (const file of pendingFiles) {
        try {
          await fileUploadService.updateUpload(file.Id, { status: "uploading", progress: 0 });
          
          const updatedFile = await fileUploadService.simulateUpload(file.Id);
          
          if (updatedFile) {
            setFiles(prev => prev.map(f => 
              f.Id === updatedFile.Id ? updatedFile : f
            ));
          }
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          await fileUploadService.updateUpload(file.Id, { 
            status: "error", 
            errorMessage: "Upload failed. Please try again." 
          });
          
          setFiles(prev => prev.map(f => 
            f.Id === file.Id 
              ? { ...f, status: "error", errorMessage: "Upload failed. Please try again." }
              : f
          ));
        }
      }

      const successCount = files.filter(f => f.status === "complete").length;
      toast.success(`All uploads complete! ${successCount} files uploaded successfully.`);
    } catch (err) {
      toast.error("Batch upload failed");
      console.error("Batch upload error:", err);
    } finally {
      setUploadingAll(false);
    }
  };

  const handleClearAll = async () => {
    const filesToClear = files.filter(file => file.status !== "uploading");
    
    if (filesToClear.length === 0) {
      toast.info("No files to clear");
      return;
    }

    try {
      await Promise.all(
        filesToClear.map(file => fileUploadService.deleteUpload(file.Id))
      );
      
      setFiles(prev => prev.filter(file => file.status === "uploading"));
      toast.success("Files cleared");
    } catch (err) {
      toast.error("Failed to clear files");
      console.error("Clear files error:", err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;
  if (!config) return <ErrorView error="Configuration not available" onRetry={loadData} />;

  const pendingFiles = files.filter(file => file.status === "pending");
  const completedFiles = files.filter(file => file.status === "complete");
  const errorFiles = files.filter(file => file.status === "error");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with User Info and Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg mb-4">
              <ApperIcon name="Upload" className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                DropZone
              </span>
            </h1>
            <p className="text-secondary text-lg">
              Upload files quickly and see upload status clearly
            </p>
          </div>
          
          {/* User Info and Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">{user.emailAddress}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="LogOut" className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* File Upload Component with ApperFileFieldComponent */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Upload</h3>
            <ApperFileFieldComponent
              elementId="file_upload_field"
              config={{
                fieldName: 'file_c',
                fieldKey: 'file_c',
                tableName: 'file_upload_c',
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
                existingFiles: files.filter(f => f.file).map(f => f.file) || [],
                fileCount: files.filter(f => f.file).length || 0
              }}
            />
          </div>
        </div>

        {/* Legacy Upload Zone (keeping for compatibility) */}
        <div className="mb-8">
          <DropZone
            onFilesSelected={handleFilesSelected}
            maxFiles={config.maxFiles}
            acceptedTypes={config.allowedTypes}
            disabled={uploadingAll}
          />
        </div>

        {/* File List */}
        {files.length > 0 ? (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 text-sm text-secondary">
                <span>{files.length} total files</span>
                {completedFiles.length > 0 && (
                  <span className="text-success">{completedFiles.length} completed</span>
                )}
                {pendingFiles.length > 0 && (
                  <span className="text-primary">{pendingFiles.length} pending</span>
                )}
                {errorFiles.length > 0 && (
                  <span className="text-error">{errorFiles.length} failed</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {pendingFiles.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUploadAll}
                    disabled={uploadingAll}
                  >
                    <ApperIcon name="Upload" className="w-4 h-4 mr-1" />
                    Upload All ({pendingFiles.length})
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={uploadingAll}
                  className="text-error hover:text-red-700"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* File Cards */}
            <div className="grid gap-4">
              {files.map((file) => (
                <FileCard
                  key={file.Id}
                  file={file}
                  onRemove={handleFileRemove}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              ))}
            </div>
          </div>
        ) : (
          <Empty 
            title="No files uploaded yet"
            description="Drag and drop files above or click browse to get started"
          />
        )}

        {/* Upload Statistics */}
        {files.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {completedFiles.length}
                </div>
                <div className="text-sm text-secondary">Successfully Uploaded</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {pendingFiles.length}
                </div>
                <div className="text-sm text-secondary">Pending Upload</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-error mb-1">
                  {errorFiles.length}
                </div>
                <div className="text-sm text-secondary">Failed Uploads</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadManager;
