import {z} from "@hono/zod-openapi";

/**
 * File upload schemas with OpenAPI metadata
 */

/**
 * Allowed MIME types for uploads
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
] as const;

/**
 * Maximum file size (10 MB)
 */
const MAX_FILE_SIZE = 10_485_760;

/**
 * File upload request schema (multipart/form-data)
 */
export const FileUploadSchema = z
  .object({
    file: z.any().openapi({
      type: "string",
      format: "binary",
      description:
        "File to upload (max 10MB, supported types: JPEG, PNG, GIF, WebP, PDF, Plain Text)",
    }),
    description: z.string().max(500).optional().openapi({
      description: "Optional description of the uploaded file",
      example: "Profile picture for user account",
    }),
  })
  .openapi("FileUpload");

export type FileUpload = z.infer<typeof FileUploadSchema>;

/**
 * File metadata schema
 */
export const FileMetadataSchema = z
  .object({
    filename: z.string().min(1).max(255).openapi({
      description: "Original filename",
      example: "document.pdf",
    }),
    mimeType: z.enum(ALLOWED_MIME_TYPES).openapi({
      description: "MIME type of the uploaded file",
      example: "application/pdf",
    }),
    size: z.number().int().min(1).max(MAX_FILE_SIZE).openapi({
      description: "File size in bytes (max 10MB)",
      example: 524_288,
    }),
    uploadedAt: z.iso.datetime().openapi({
      description: "ISO 8601 timestamp when file was uploaded",
      example: "2025-11-08T12:00:00Z",
    }),
  })
  .openapi("FileMetadata");

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

/**
 * Upload response schema
 */
export const UploadResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Upload success status",
      example: true,
    }),
    file: FileMetadataSchema,
    message: z.string().optional().openapi({
      description: "Optional success message",
      example: "File uploaded successfully",
    }),
  })
  .openapi("UploadResponse", {
    description: "Successful file upload response",
  });

export type UploadResponse = z.infer<typeof UploadResponseSchema>;
