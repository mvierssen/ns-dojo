import type {Context} from "hono";
import {FileMetadataSchema} from "../schemas/upload.js";

/**
 * Handle file upload
 *
 * Demonstrates:
 * - Multipart form parsing
 * - File validation
 * - Size limits (enforced by bodyLimit middleware)
 *
 * Production considerations:
 * - Store files in object storage (S3, GCS, etc.)
 * - Generate unique filenames
 * - Scan for malware
 * - Create thumbnails for images
 * - Track upload metadata in database
 */
export async function handleUpload(c: Context) {
  // Parse multipart form data
  const body = await c.req.parseBody();
  const file = body.file;

  // Validate file was provided
  if (!file || typeof file === "string") {
    return c.json(
      {
        type: "about:blank#bad-request",
        title: "Bad Request",
        status: 400,
        detail: "No file provided in 'file' field",
      },
      400,
    );
  }

  // Extract metadata
  const metadata = {
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  };

  // Validate metadata with Zod
  const result = FileMetadataSchema.safeParse(metadata);

  if (!result.success) {
    return c.json(
      {
        type: "about:blank#bad-request",
        title: "Bad Request",
        status: 400,
        detail: "Invalid file metadata",
        issues: result.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
          code: issue.code,
        })),
      },
      400,
    );
  }

  // In production, persist the file:
  // const buffer = await file.arrayBuffer();
  // await objectStorage.upload(file.name, buffer);

  return c.json({
    success: true,
    file: result.data,
    message: "File uploaded successfully (not persisted in this demo)",
  });
}
