import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs for tracking lifecycle
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent re-renders and detect actual changes
  const memoizedExistingFiles = useMemo(() => {
    const files = config?.existingFiles;
    if (!files || !Array.isArray(files)) return [];
    
    // Return empty array if same length and first file ID matches (indicates same files)
    const currentFiles = existingFilesRef.current;
    if (files.length === currentFiles.length && 
        files.length > 0 && 
        currentFiles.length > 0 &&
        (files[0]?.Id === currentFiles[0]?.Id || files[0]?.id === currentFiles[0]?.id)) {
      return currentFiles;
    }
    
    return files;
  }, [config?.existingFiles?.length, config?.existingFiles?.[0]?.Id, config?.existingFiles?.[0]?.id]);

  // Initial Mount Effect
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to load (max 50 attempts × 100ms = 5 seconds)
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        
        // Set element ID for uploader instance
        elementIdRef.current = elementId;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });

        mountedRef.current = true;
        existingFilesRef.current = memoizedExistingFiles;
        setIsReady(true);
        setError(null);

      } catch (error) {
        console.error('Failed to initialize ApperFileFieldComponent:', error);
        setError(error.message);
        setIsReady(false);
      }
    };

    initializeSDK();

    // Cleanup on unmount
    return () => {
      try {
        if (window.ApperSDK && mountedRef.current) {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        existingFilesRef.current = [];
      } catch (error) {
        console.error('Error during ApperFileFieldComponent unmount:', error);
      }
    };
  }, [elementId, JSON.stringify(memoizedExistingFiles)]);

  // File Update Effect
  useEffect(() => {
    const updateFiles = async () => {
      // Early returns
      if (!isReady || !window.ApperSDK || !config?.fieldKey) return;
      
      const { ApperFileUploader } = window.ApperSDK;
      
      // Deep equality check with current ref
      if (JSON.stringify(memoizedExistingFiles) === JSON.stringify(existingFilesRef.current)) {
        return;
      }

      try {
        // Format detection and conversion
        let filesToUpdate = memoizedExistingFiles;
        
        if (filesToUpdate.length > 0) {
          // Check if format conversion is needed (API format has .Id, UI format has .id)
          const firstFile = filesToUpdate[0];
          if (firstFile.Id && !firstFile.id) {
            // Convert from API format to UI format
            filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
          }
          
          // Update files
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          // Clear field if empty
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }

        existingFilesRef.current = memoizedExistingFiles;
        
      } catch (error) {
        console.error('Error updating files in ApperFileFieldComponent:', error);
        setError(error.message);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config?.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <div className="flex items-center">
          <div className="text-red-800 text-sm">
            <strong>File Upload Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container - SDK takes over this */}
      <div id={elementId} className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg">
        {/* Loading UI when not ready */}
        {!isReady && (
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-gray-500">Loading file uploader...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;