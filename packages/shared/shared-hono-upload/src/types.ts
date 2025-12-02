/**
 * Upload configuration options
 */
export interface UploadConfig {
  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxFileSize?: number;

  /**
   * Maximum number of files allowed
   * @default 10
   */
  maxFiles?: number;

  /**
   * Allowed MIME types
   * @default ["image/jpeg", "image/jpg", "image/png", "image/webp"]
   */
  allowedMimeTypes?: string[];
}

/**
 * Processed file result after image processing
 */
export interface ProcessedFile {
  /**
   * Sanitized original filename
   */
  originalname: string;

  /**
   * MIME type (always "image/webp" after processing)
   */
  mimetype: string;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * Processed image buffer (WebP format)
   */
  buffer: Buffer;

  /**
   * Thumbnail buffer (WebP format, 300x300)
   */
  thumbnail: Buffer;

  /**
   * Image width in pixels
   */
  width?: number;

  /**
   * Image height in pixels
   */
  height?: number;
}
