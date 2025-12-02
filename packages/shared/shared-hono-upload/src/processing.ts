import sharp from "sharp";
import type {ProcessedFile} from "./types.js";
import {
  fileToBuffer,
  sanitizeFilename,
  validateMagicNumbers,
} from "./validation.js";

/**
 * Process image: convert to WebP, resize, generate thumbnail
 */
export async function processImage(file: File): Promise<ProcessedFile> {
  const buffer = await fileToBuffer(file);

  // Validate magic numbers
  const magicValidation = validateMagicNumbers(buffer);
  if (!magicValidation.valid) {
    throw new Error(magicValidation.error);
  }

  // Get image metadata
  const metadata = await sharp(buffer).metadata();

  // Resize to max dimensions and convert to WebP
  const processedBuffer = await sharp(buffer)
    .resize(1920, 1080, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({quality: 85})
    .toBuffer();

  // Generate thumbnail (300x300, cover fit)
  const thumbnail = await sharp(buffer)
    .resize(300, 300, {
      fit: "cover",
    })
    .webp({quality: 70})
    .toBuffer();

  return {
    originalname: sanitizeFilename(file.name),
    mimetype: "image/webp",
    size: processedBuffer.length,
    buffer: processedBuffer,
    thumbnail,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Process multiple images
 */
export async function processImages(files: File[]): Promise<ProcessedFile[]> {
  const processedFiles: ProcessedFile[] = [];

  for (const file of files) {
    try {
      const processed = await processImage(file);
      processedFiles.push(processed);
    } catch (error) {
      throw new Error(
        `Error processing image ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return processedFiles;
}
