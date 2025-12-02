import {z} from "zod";

/**
 * Upload configuration schema
 */
export const UploadConfigSchema = z.object({
  maxFileSize: z.number().int().positive().optional(),
  maxFiles: z.number().int().positive().optional(),
  allowedMimeTypes: z.array(z.string()).optional(),
});

/**
 * Processed file schema
 */
export const ProcessedFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number().int().nonnegative(),
  buffer: z.instanceof(Buffer),
  thumbnail: z.instanceof(Buffer),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
