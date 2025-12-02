// Middleware
export {
  createUploadMiddleware,
  uploadSingle,
  uploadMultiple,
  processImagesMiddleware,
  getProcessedFile,
  getProcessedFiles,
  DEFAULT_UPLOAD_CONFIG,
} from "./upload.js";

// Processing
export {processImage, processImages} from "./processing.js";

// Validation
export {
  fileToBuffer,
  validateFileType,
  validateMagicNumbers,
  validateFileSize,
  sanitizeFilename,
} from "./validation.js";

// Types
export type {UploadConfig, ProcessedFile} from "./types.js";

// Schemas
export {UploadConfigSchema, ProcessedFileSchema} from "./schemas.js";
