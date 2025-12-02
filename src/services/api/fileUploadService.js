import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class FileUploadService {
  constructor() {
    // Define field mappings from UI to database
    this.uploadFields = [
      {"field": {"Name": "Name"}},
      {"field": {"Name": "Tags"}}, 
      {"field": {"Name": "size_c"}},
      {"field": {"Name": "type_c"}},
      {"field": {"Name": "status_c"}},
      {"field": {"Name": "progress_c"}},
      {"field": {"Name": "uploaded_at_c"}},
      {"field": {"Name": "url_c"}},
      {"field": {"Name": "thumbnail_url_c"}},
      {"field": {"Name": "error_message_c"}},
      {"field": {"Name": "file_c"}}
    ];

    this.configFields = [
      {"field": {"Name": "Name"}},
      {"field": {"Name": "max_file_size_c"}},
      {"field": {"Name": "allowed_types_c"}},
      {"field": {"Name": "max_files_c"}},
      {"field": {"Name": "auto_upload_c"}}
    ];

    // Default configuration
    this.defaultConfig = {
      max_file_size_c: 10485760, // 10MB
      max_files_c: 10,
      allowed_types_c: "image/jpeg,image/png,image/gif,application/pdf,text/plain",
      auto_upload_c: false
    };
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getConfig() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return this.defaultConfig;
      }

      const response = await apperClient.fetchRecords('upload_config_c', {
        fields: this.configFields,
        pagingInfo: { limit: 1, offset: 0 }
      });

      if (!response?.data?.length) {
        // Return default config if no records found
        return {
          maxFileSize: this.defaultConfig.max_file_size_c,
          maxFiles: this.defaultConfig.max_files_c,
          allowedTypes: this.defaultConfig.allowed_types_c.split(','),
          autoUpload: this.defaultConfig.auto_upload_c
        };
      }

      const config = response.data[0];
      return {
        maxFileSize: config.max_file_size_c || this.defaultConfig.max_file_size_c,
        maxFiles: config.max_files_c || this.defaultConfig.max_files_c,
        allowedTypes: config.allowed_types_c ? config.allowed_types_c.split(',') : this.defaultConfig.allowed_types_c.split(','),
        autoUpload: config.auto_upload_c || this.defaultConfig.auto_upload_c
      };
    } catch (error) {
      console.error("Error fetching upload config:", error?.response?.data?.message || error);
      return {
        maxFileSize: this.defaultConfig.max_file_size_c,
        maxFiles: this.defaultConfig.max_files_c,
        allowedTypes: this.defaultConfig.allowed_types_c.split(','),
        autoUpload: this.defaultConfig.auto_upload_c
      };
    }
  }

  async getAllUploads() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const response = await apperClient.fetchRecords('file_upload_c', {
        fields: this.uploadFields,
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: { limit: 50, offset: 0 }
      });

      if (!response?.data?.length) {
        return [];
      }

      // Map database fields to UI format
      return response.data.map(upload => ({
        Id: upload.Id,
        name: upload.Name || '',
        size: upload.size_c || 0,
        type: upload.type_c || '',
        status: upload.status_c || 'pending',
        progress: upload.progress_c || 0,
        uploadedAt: upload.uploaded_at_c || new Date().toISOString(),
        url: upload.url_c || '',
        thumbnailUrl: upload.thumbnail_url_c || '',
        errorMessage: upload.error_message_c || '',
        file: upload.file_c || null
      }));
    } catch (error) {
      console.error("Error fetching uploads:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getUploadById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const response = await apperClient.getRecordById('file_upload_c', parseInt(id), {
        fields: this.uploadFields
      });

      if (!response?.data) {
        return null;
      }

      const upload = response.data;
      return {
        Id: upload.Id,
        name: upload.Name || '',
        size: upload.size_c || 0,
        type: upload.type_c || '',
        status: upload.status_c || 'pending',
        progress: upload.progress_c || 0,
        uploadedAt: upload.uploaded_at_c || new Date().toISOString(),
        url: upload.url_c || '',
        thumbnailUrl: upload.thumbnail_url_c || '',
        errorMessage: upload.error_message_c || '',
        file: upload.file_c || null
      };
    } catch (error) {
      console.error(`Error fetching upload ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async createUpload(file) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: file.name,
          size_c: file.size,
          type_c: file.type,
          status_c: "pending",
          progress_c: 0,
          uploaded_at_c: new Date().toISOString(),
          url_c: "",
          thumbnail_url_c: "",
          error_message_c: ""
        }]
      };

      const response = await apperClient.createRecord('file_upload_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} uploads:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            name: created.Name || file.name,
            size: created.size_c || file.size,
            type: created.type_c || file.type,
            status: created.status_c || 'pending',
            progress: created.progress_c || 0,
            uploadedAt: created.uploaded_at_c || new Date().toISOString(),
            url: created.url_c || '',
            thumbnailUrl: created.thumbnail_url_c || '',
            errorMessage: created.error_message_c || ''
          };
        }
      }

      throw new Error("Failed to create upload record");
    } catch (error) {
      console.error("Error creating upload:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async updateUpload(id, data) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Map UI fields to database fields
      const updateData = {
        Id: parseInt(id)
      };

      if (data.name !== undefined) updateData.Name = data.name;
      if (data.size !== undefined) updateData.size_c = data.size;
      if (data.type !== undefined) updateData.type_c = data.type;
      if (data.status !== undefined) updateData.status_c = data.status;
      if (data.progress !== undefined) updateData.progress_c = data.progress;
      if (data.uploadedAt !== undefined) updateData.uploaded_at_c = data.uploadedAt;
      if (data.url !== undefined) updateData.url_c = data.url;
      if (data.thumbnailUrl !== undefined) updateData.thumbnail_url_c = data.thumbnailUrl;
      if (data.errorMessage !== undefined) updateData.error_message_c = data.errorMessage;
      if (data.file !== undefined) updateData.file_c = data.file;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('file_upload_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} uploads:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.Name || '',
            size: updated.size_c || 0,
            type: updated.type_c || '',
            status: updated.status_c || 'pending',
            progress: updated.progress_c || 0,
            uploadedAt: updated.uploaded_at_c || new Date().toISOString(),
            url: updated.url_c || '',
            thumbnailUrl: updated.thumbnail_url_c || '',
            errorMessage: updated.error_message_c || ''
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating upload:", error?.response?.data?.message || error);
      return null;
    }
  }

  async deleteUpload(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return false;
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('file_upload_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} uploads:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting upload:", error?.response?.data?.message || error);
      return false;
    }
  }

  async simulateUpload(id, onProgress) {
    // Simulate upload progress
    await this.delay(100);
    
    // Update to uploading status
    await this.updateUpload(id, { status: "uploading", progress: 0 });

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await this.delay(200);
      await this.updateUpload(id, { progress });
      if (onProgress) onProgress(progress);
    }

    // Complete upload
    const completedData = {
      status: "complete",
      progress: 100,
      url: `https://example.com/uploads/${Date.now()}`,
      thumbnailUrl: ""
    };

    // Get current upload to check type for thumbnail
    const currentUpload = await this.getUploadById(id);
    if (currentUpload && currentUpload.type.startsWith("image/")) {
      completedData.thumbnailUrl = `https://example.com/thumbnails/${Date.now()}`;
    }

    return await this.updateUpload(id, completedData);
  }

  validateFile(file) {
    const errors = [];

    // Default validation if no config available
    const maxFileSize = 10485760; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${this.formatFileSize(maxFileSize)} limit`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    return errors;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getFileIcon(type) {
    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Music";
    if (type.includes("pdf")) return "FileText";
    if (type.includes("word") || type.includes("document")) return "FileText";
    if (type.includes("text")) return "FileText";
    return "File";
  }
}

export default new FileUploadService();