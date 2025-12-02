import {createProblemDetails} from "@ns-dojo/shared-hono";
import type {Context, MiddlewareHandler} from "hono";
import {processImages} from "./processing.js";
import {UploadConfigSchema} from "./schemas.js";
import type {ProcessedFile, UploadConfig} from "./types.js";
import {validateFileSize, validateFileType} from "./validation.js";

export const DEFAULT_UPLOAD_CONFIG: Required<UploadConfig> = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

/**
 * Create upload middleware with custom configuration
 */
export function createUploadMiddleware(
  config: UploadConfig = {},
): MiddlewareHandler {
  const parsed = UploadConfigSchema.parse(config);
  const {
    maxFileSize = DEFAULT_UPLOAD_CONFIG.maxFileSize,
    maxFiles = DEFAULT_UPLOAD_CONFIG.maxFiles,
    allowedMimeTypes = DEFAULT_UPLOAD_CONFIG.allowedMimeTypes,
  } = parsed;

  return async (c: Context, next) => {
    try {
      const body = await c.req.parseBody();
      const filesRaw = body.files ?? body.file;

      let files: File[] = [];
      if (Array.isArray(filesRaw)) {
        files = filesRaw.filter((f): f is File => f instanceof File);
      } else if (filesRaw instanceof File) {
        files = [filesRaw];
      }

      // Validate file count
      if (files.length === 0) {
        return c.json(
          createProblemDetails(
            400,
            "No files provided",
            "Request must include at least one file",
            "NO_FILES",
          ),
          400,
        );
      }

      if (files.length > maxFiles) {
        return c.json(
          createProblemDetails(
            400,
            "Too many files",
            `Maximum ${String(maxFiles)} files allowed, received ${String(files.length)}`,
            "TOO_MANY_FILES",
          ),
          400,
        );
      }

      // Validate each file
      for (const file of files) {
        // Check file type
        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
          return c.json(
            createProblemDetails(
              400,
              "Invalid file type",
              typeValidation.error ??
                `File ${file.name} has invalid type. Allowed: ${allowedMimeTypes.join(", ")}`,
              "INVALID_FILE_TYPE",
            ),
            400,
          );
        }

        // Check file size
        const sizeValidation = validateFileSize(file, maxFileSize);
        if (!sizeValidation.valid) {
          return c.json(
            createProblemDetails(
              400,
              "File too large",
              sizeValidation.error ?? `File ${file.name} exceeds size limit`,
              "FILE_TOO_LARGE",
            ),
            400,
          );
        }

        // Check MIME type
        if (!allowedMimeTypes.includes(file.type)) {
          return c.json(
            createProblemDetails(
              400,
              "Invalid MIME type",
              `File ${file.name} has invalid MIME type: ${file.type}. Allowed: ${allowedMimeTypes.join(", ")}`,
              "INVALID_MIME_TYPE",
            ),
            400,
          );
        }
      }

      // Store files in context
      if (files.length === 1) {
        c.set("file", files[0]);
      } else {
        c.set("files", files);
      }

      await next();
    } catch (error) {
      return c.json(
        createProblemDetails(
          500,
          "Upload error",
          error instanceof Error ? error.message : "Failed to process upload",
          "UPLOAD_ERROR",
        ),
        500,
      );
    }
  };
}

/**
 * Upload single file middleware (default field name: "file")
 */
export function uploadSingle(_fieldName = "file"): MiddlewareHandler {
  return createUploadMiddleware({
    maxFiles: 1,
  });
}

/**
 * Upload multiple files middleware (default field name: "files")
 */
export function uploadMultiple(
  _fieldName = "files",
  maxCount?: number,
): MiddlewareHandler {
  return createUploadMiddleware({
    maxFiles: maxCount,
  });
}

/**
 * Process uploaded images: validate, resize, convert to WebP, generate thumbnails
 */
const processImagesHandler: MiddlewareHandler = async (c: Context, next) => {
  try {
    const file = c.get("file") as File | undefined;
    const files = c.get("files") as File[] | undefined;

    const filesToProcess = files ?? (file ? [file] : []);

    if (filesToProcess.length === 0) {
      await next();
      return;
    }

    const processedFiles = await processImages(filesToProcess);

    // Store processed files in context
    if (processedFiles.length === 1) {
      c.set("processedFile", processedFiles[0]);
    } else {
      c.set("processedFiles", processedFiles);
    }

    await next();
  } catch (error) {
    return c.json(
      createProblemDetails(
        400,
        "Image processing error",
        error instanceof Error ? error.message : "Failed to process images",
        "IMAGE_PROCESSING_ERROR",
      ),
      400,
    );
  }
};

export function processImagesMiddleware(): MiddlewareHandler {
  return processImagesHandler;
}

/**
 * Get processed file from context
 */
export function getProcessedFile(c: Context): ProcessedFile | undefined {
  return c.get("processedFile") as ProcessedFile | undefined;
}

/**
 * Get processed files from context
 */
export function getProcessedFiles(c: Context): ProcessedFile[] | undefined {
  return c.get("processedFiles") as ProcessedFile[] | undefined;
}
