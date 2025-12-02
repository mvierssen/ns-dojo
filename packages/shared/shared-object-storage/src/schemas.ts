import {z} from "zod";

export const StorageConfigSchema = z.object({
  endpoint: z.httpUrl(),
  bucketName: z.string(),
  region: z.string().optional(),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  publicUrl: z.httpUrl().optional(),
});

export const UploadOptionsSchema = z.object({
  folder: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const UploadResultSchema = z.object({
  url: z.httpUrl(),
  key: z.string(),
  originalname: z.string(),
  size: z.number(),
  mimetype: z.string(),
});
