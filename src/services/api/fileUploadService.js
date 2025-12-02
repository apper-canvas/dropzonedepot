import uploadConfigData from "@/services/mockData/uploadConfig.json";
import fileUploadsData from "@/services/mockData/fileUploads.json";

class FileUploadService {
  constructor() {
    this.uploads = [...fileUploadsData];
    this.config = { ...uploadConfigData };
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getConfig() {
    await this.delay();
    return { ...this.config };
  }

  async getAllUploads() {
    await this.delay();
    return [...this.uploads];
  }

  async getUploadById(id) {
    await this.delay();
    return this.uploads.find(upload => upload.Id === parseInt(id)) || null;
  }

  async createUpload(file) {
    await this.delay();
    
    const newId = this.uploads.length > 0 ? Math.max(...this.uploads.map(u => u.Id)) + 1 : 1;
    
    const upload = {
      Id: newId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
      uploadedAt: new Date().toISOString(),
      url: "",
      thumbnailUrl: "",
      errorMessage: ""
    };

    this.uploads.push(upload);
    return { ...upload };
  }

  async updateUpload(id, data) {
    await this.delay(100);
    
    const index = this.uploads.findIndex(upload => upload.Id === parseInt(id));
    if (index === -1) return null;

    this.uploads[index] = { ...this.uploads[index], ...data };
    return { ...this.uploads[index] };
  }

  async deleteUpload(id) {
    await this.delay();
    
    const index = this.uploads.findIndex(upload => upload.Id === parseInt(id));
    if (index === -1) return false;

    this.uploads.splice(index, 1);
    return true;
  }

  async simulateUpload(id, onProgress) {
    const upload = this.uploads.find(u => u.Id === parseInt(id));
    if (!upload) return null;

    // Update to uploading status
    upload.status = "uploading";
    upload.progress = 0;

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await this.delay(200);
      upload.progress = progress;
      if (onProgress) onProgress(progress);
    }

    // Complete upload
    upload.status = "complete";
    upload.progress = 100;
    upload.url = `https://example.com/uploads/${upload.name}`;
    
    // Generate thumbnail for images
    if (upload.type.startsWith("image/")) {
      upload.thumbnailUrl = `https://example.com/thumbnails/${upload.name}`;
    }

    return { ...upload };
  }

  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size exceeds ${this.formatFileSize(this.config.maxFileSize)} limit`);
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
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