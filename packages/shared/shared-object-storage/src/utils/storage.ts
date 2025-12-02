import {randomUUID} from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {createModuleLogger} from "@ns-dojo/shared-logging";
import {z} from "zod";
import type {StorageConfig, UploadOptions, UploadResult} from "../types.js";

const logger = createModuleLogger("ObjectStorage");

const StorageEnvSchema = z.object({
  endpoint: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  bucketName: z.string().min(1),
  region: z.string().optional(),
  publicUrl: z.string().optional(),
});

export class ObjectStorage {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl?: string;

  constructor(config: StorageConfig) {
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;

    this.s3Client = new S3Client({
      region: config.region ?? "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const fileExtension = filename.split(".").pop() ?? "bin";
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const key = options.folder
      ? `${options.folder}/${uniqueFilename}`
      : uniqueFilename;

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ContentLength: buffer.length,
      Metadata: {
        "original-name": filename,
        ...options.metadata,
      },
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `https://${this.bucketName}.s3.amazonaws.com/${key}`;

      return {
        url,
        key,
        originalname: filename,
        size: buffer.length,
        mimetype,
      };
    } catch (error) {
      logger.error("Error uploading to object storage", {
        key,
        filename,
        mimetype,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Upload failed: ${String(error)}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      logger.error("Error deleting from object storage", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Delete failed: ${String(error)}`);
    }
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, {expiresIn});
  }

  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      return pathParts.slice(1).join("/");
    } catch {
      return null;
    }
  }
}

let defaultStorage: ObjectStorage | null = null;

export function getDefaultStorage(): ObjectStorage {
  if (defaultStorage) {
    return defaultStorage;
  }

  const config = getStorageConfigFromEnv();
  if (!config) {
    throw new Error(
      "Storage not configured. Please set object storage environment variables.",
    );
  }

  defaultStorage = new ObjectStorage(config);
  return defaultStorage;
}

export function getStorageConfigFromEnv(): StorageConfig | null {
  const endpoint = process.env.S3_ENDPOINT ?? process.env.R2_ENDPOINT;
  const accessKeyId =
    process.env.S3_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.S3_BUCKET_NAME ?? process.env.R2_BUCKET_NAME;
  const region = process.env.S3_REGION ?? process.env.R2_REGION;
  const publicUrl = process.env.S3_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  const parsed = StorageEnvSchema.safeParse({
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucketName,
    region,
    publicUrl,
  });

  if (!parsed.success) {
    logger.error("Invalid storage configuration", {
      error: parsed.error.message,
    });
    return null;
  }

  return parsed.data;
}

export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const storage = getDefaultStorage();
  return storage.uploadFile(buffer, filename, mimetype, options);
}

export async function deleteFromStorage(key: string): Promise<void> {
  const storage = getDefaultStorage();
  return storage.deleteFile(key);
}

export function extractKeyFromUrl(url: string): string | null {
  return ObjectStorage.extractKeyFromUrl(url);
}
