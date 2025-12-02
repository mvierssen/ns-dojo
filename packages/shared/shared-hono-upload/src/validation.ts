/**
 * Supported image MIME types
 */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Magic number signatures for image validation
 */
const MAGIC_NUMBERS = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
  heic: [0x00, 0x00, 0x00], // ftyp box prefix
} as const;

/**
 * Convert web standard File to Node.js Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Validate file type by MIME type and extension
 */
export function validateFileType(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, HEIC`,
    };
  }

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "heic",
    "heif",
  ]);
  if (!extension || !validExtensions.has(extension)) {
    const extensionStr = extension ?? "unknown";
    return {
      valid: false,
      error: `Invalid file extension: ${extensionStr}. Allowed: jpg, jpeg, png, webp, heic`,
    };
  }

  return {valid: true};
}

/**
 * Validate file magic numbers (first few bytes)
 */
export function validateMagicNumbers(buffer: Buffer): {
  valid: boolean;
  error?: string;
} {
  // Check JPEG signature
  if (
    buffer[0] === MAGIC_NUMBERS.jpeg[0] &&
    buffer[1] === MAGIC_NUMBERS.jpeg[1] &&
    buffer[2] === MAGIC_NUMBERS.jpeg[2]
  ) {
    return {valid: true};
  }

  // Check PNG signature
  if (
    buffer[0] === MAGIC_NUMBERS.png[0] &&
    buffer[1] === MAGIC_NUMBERS.png[1] &&
    buffer[2] === MAGIC_NUMBERS.png[2] &&
    buffer[3] === MAGIC_NUMBERS.png[3]
  ) {
    return {valid: true};
  }

  // Check WebP signature (RIFF)
  if (
    buffer[0] === MAGIC_NUMBERS.webp[0] &&
    buffer[1] === MAGIC_NUMBERS.webp[1] &&
    buffer[2] === MAGIC_NUMBERS.webp[2] &&
    buffer[3] === MAGIC_NUMBERS.webp[3]
  ) {
    return {valid: true};
  }

  // Check HEIC/HEIF signature
  if (
    buffer[0] === MAGIC_NUMBERS.heic[0] &&
    buffer[1] === MAGIC_NUMBERS.heic[1] &&
    buffer[2] === MAGIC_NUMBERS.heic[2]
  ) {
    return {valid: true};
  }

  return {
    valid: false,
    error: "File does not match expected image format signatures",
  };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSize: number = 10 * 1024 * 1024,
): {valid: boolean; error?: string} {
  if (file.size > maxSize) {
    const fileSizeStr = String(file.size);
    const maxSizeStr = String(maxSize);
    const maxSizeMB = String(Math.round(maxSize / 1024 / 1024));
    return {
      valid: false,
      error: `File size ${fileSizeStr} bytes exceeds maximum ${maxSizeStr} bytes (${maxSizeMB}MB)`,
    };
  }
  return {valid: true};
}

/**
 * Sanitize filename to prevent path traversal and injection
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  const name = filename.replaceAll(/[/\\]/g, "");

  // Remove special characters except dot, dash, underscore
  const sanitized = name.replaceAll(/[^\w.-]/g, "_");

  // Ensure filename doesn't start with dot (hidden file)
  return sanitized.startsWith(".") ? `file${sanitized}` : sanitized;
}
