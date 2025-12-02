import type {z} from "zod";
import type {
  StorageConfigSchema,
  UploadOptionsSchema,
  UploadResultSchema,
} from "./schemas.js";

export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type UploadOptions = z.infer<typeof UploadOptionsSchema>;
export type UploadResult = z.infer<typeof UploadResultSchema>;
