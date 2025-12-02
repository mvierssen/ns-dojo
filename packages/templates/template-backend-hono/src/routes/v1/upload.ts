import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {bodyLimit} from "hono/body-limit";
import {defaultHook} from "../../openapi/config.js";
import {ProblemDetailsSchema} from "../../schemas/common.js";
import {
  FileMetadataSchema,
  FileUploadSchema,
  UploadResponseSchema,
} from "../../schemas/upload.js";

/**
 * File upload router (v1)
 *
 * Demonstrates:
 * - Multipart form data handling
 * - File size limits (per-route override)
 * - File metadata validation
 * - Error responses for invalid uploads
 *
 * Client example (JavaScript):
 * ```js
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 *
 * const response = await fetch('/api/v1/upload', {
 *   method: 'POST',
 *   body: formData,
 * });
 * ```
 *
 * curl example:
 * ```bash
 * curl -X POST http://localhost:3000/api/v1/upload \
 *   -F "file=@example.pdf"
 * ```
 */

export const uploadRouter = new OpenAPIHono({defaultHook});

/**
 * Upload a file
 * Accepts multipart/form-data with a 'file' field
 * Size limit: 10 MB (override default if needed)
 */
const uploadFileRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Upload"],
  summary: "Upload a file",
  description: "Upload a file with optional metadata (max 10MB)",
  operationId: "uploadFile",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: FileUploadSchema,
        },
      },
      required: true,
    },
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    200: {
      description: "File uploaded successfully",
      content: {
        "application/json": {
          schema: UploadResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid file or validation error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    413: {
      description: "Payload too large - file exceeds 10MB limit",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

// Apply body limit middleware for uploads (10 MB)
uploadRouter.use(
  "/",
  bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c) => {
      return c.json(
        {
          type: "about:blank#payload-too-large",
          title: "Payload Too Large",
          status: 413,
          detail: "File size exceeds maximum allowed size of 10 MB",
        },
        413,
      );
    },
  }),
);

uploadRouter.openapi(uploadFileRoute, async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

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

  const metadata = {
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };

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

  return c.json(
    {
      success: true,
      file: result.data,
      message: "File uploaded successfully (not persisted in this demo)",
    },
    200,
  );
});
