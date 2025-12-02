import {Hono} from "hono";
import sharp from "sharp";
import {describe, expect, it} from "vitest";
import {processImage, processImages} from "./processing.js";
import {
  createUploadMiddleware,
  getProcessedFile,
  getProcessedFiles,
} from "./upload.js";
import {
  fileToBuffer,
  sanitizeFilename,
  validateFileSize,
  validateFileType,
  validateMagicNumbers,
} from "./validation.js";

/**
 * Create a minimal valid test image using Sharp
 */
async function createTestImage(width = 100, height = 100): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: {r: 255, g: 0, b: 0},
    },
  })
    .jpeg()
    .toBuffer();
}

describe("File Validation", () => {
  describe("validateFileType", () => {
    it("should accept valid JPEG file", () => {
      const file = new File(["test"], "test.jpg", {type: "image/jpeg"});
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid PNG file", () => {
      const file = new File(["test"], "test.png", {type: "image/png"});
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it("should accept valid WebP file", () => {
      const file = new File(["test"], "test.webp", {type: "image/webp"});
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it("should accept valid HEIC file", () => {
      const file = new File(["test"], "test.heic", {type: "image/heic"});
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid MIME type", () => {
      const file = new File(["test"], "test.pdf", {type: "application/pdf"});
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
      expect(result.error).toContain("application/pdf");
    });

    it("should reject invalid extension", () => {
      const file = new File(["test"], "test.txt", {type: "image/jpeg"});
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file extension");
      expect(result.error).toContain("txt");
    });

    it("should reject file with no extension", () => {
      const file = new File(["test"], "test", {type: "image/jpeg"});
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file extension");
    });
  });

  describe("validateMagicNumbers", () => {
    it("should accept valid JPEG magic numbers", () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(true);
    });

    it("should accept valid PNG magic numbers", () => {
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(true);
    });

    it("should accept valid WebP magic numbers (RIFF)", () => {
      const buffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00]);
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(true);
    });

    it("should accept valid HEIC magic numbers", () => {
      const buffer = Buffer.from([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
      ]);
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid magic numbers", () => {
      const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // ZIP file signature
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match expected image format");
    });

    it("should reject text file pretending to be an image", () => {
      const buffer = Buffer.from("This is a text file", "utf8");
      const result = validateMagicNumbers(buffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("validateFileSize", () => {
    it("should accept file within default size limit (10MB)", () => {
      const content = "x".repeat(1000); // 1KB
      const file = new File([content], "test.jpg", {type: "image/jpeg"});
      const result = validateFileSize(file);
      expect(result.valid).toBe(true);
    });

    it("should accept file at exactly the size limit", () => {
      const maxSize = 1024;
      const content = "x".repeat(1024);
      const file = new File([content], "test.jpg", {type: "image/jpeg"});
      const result = validateFileSize(file, maxSize);
      expect(result.valid).toBe(true);
    });

    it("should reject file exceeding size limit", () => {
      const maxSize = 1000;
      const content = "x".repeat(2000);
      const file = new File([content], "test.jpg", {type: "image/jpeg"});
      const result = validateFileSize(file, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum");
      expect(result.error).toContain("2000"); // File size
      expect(result.error).toContain("1000"); // Max size
    });

    it("should use default 10MB limit when no limit specified", () => {
      const content = "x".repeat(11 * 1024 * 1024); // 11MB
      const file = new File([content], "large.jpg", {type: "image/jpeg"});
      const result = validateFileSize(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum");
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove path traversal attempts", () => {
      const result = sanitizeFilename("../../etc/passwd");
      expect(result).not.toContain("/");
      expect(result).not.toContain("\\");
      // Sanitize removes slashes and prefixes with "file" if starts with dot
      expect(result).toBe("file....etcpasswd");
    });

    it("should remove special characters that could cause XSS", () => {
      const result = sanitizeFilename("test<script>alert('xss')</script>.jpg");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toBe("test_script_alert__xss___script_.jpg");
    });

    it("should preserve valid characters (alphanumeric, dash, underscore, dot)", () => {
      const result = sanitizeFilename("my-photo_2024.test.jpg");
      expect(result).toBe("my-photo_2024.test.jpg");
    });

    it("should handle unicode characters", () => {
      const result = sanitizeFilename("photo_été_2024.jpg");
      expect(result).toBe("photo__t__2024.jpg");
    });

    it("should prefix hidden files (starting with dot)", () => {
      const result = sanitizeFilename(".hidden");
      expect(result).toBe("file.hidden");
      expect(result).not.toMatch(/^\./);
    });

    it("should handle Windows path separators", () => {
      const result = sanitizeFilename(String.raw`C:\Users\test\photo.jpg`);
      expect(result).not.toContain("\\");
      expect(result).toBe("C_Userstestphoto.jpg");
    });
  });
});

describe("File Conversion", () => {
  describe("fileToBuffer", () => {
    it("should convert File to Buffer", async () => {
      const content = "test content";
      const file = new File([content], "test.txt", {type: "text/plain"});
      const buffer = await fileToBuffer(file);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe(content);
    });

    it("should handle binary data", async () => {
      const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const file = new File([bytes], "test.jpg", {type: "image/jpeg"});
      const buffer = await fileToBuffer(file);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer[0]).toBe(0xff);
      expect(buffer[1]).toBe(0xd8);
      expect(buffer[2]).toBe(0xff);
      expect(buffer[3]).toBe(0xe0);
    });
  });
});

describe("Image Processing", () => {
  describe("processImage", () => {
    it("should reject file with invalid magic numbers", async () => {
      const fakeImageData = "Not a real image";
      const file = new File([fakeImageData], "fake.jpg", {type: "image/jpeg"});

      await expect(processImage(file)).rejects.toThrow(
        "does not match expected",
      );
    });

    it("should process valid JPEG image", async () => {
      const imageBuffer = await createTestImage(100, 100);
      const file = new File([new Uint8Array(imageBuffer)], "test.jpg", {
        type: "image/jpeg",
      });

      const result = await processImage(file);

      expect(result.originalname).toBe("test.jpg");
      expect(result.mimetype).toBe("image/webp");
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.thumbnail).toBeInstanceOf(Buffer);
      expect(result.size).toBeGreaterThan(0);
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
    });

    it("should sanitize filename", async () => {
      const imageBuffer = await createTestImage(100, 100);
      const file = new File(
        [new Uint8Array(imageBuffer)],
        "../../evil<script>.jpg",
        {
          type: "image/jpeg",
        },
      );

      const result = await processImage(file);

      expect(result.originalname).not.toContain("/");
      expect(result.originalname).not.toContain("<");
      expect(result.originalname).not.toContain(">");
    });
  });

  describe("processImages", () => {
    it("should process multiple images", async () => {
      const imageBuffer = await createTestImage(100, 100);

      const files = [
        new File([new Uint8Array(imageBuffer)], "image1.jpg", {
          type: "image/jpeg",
        }),
        new File([new Uint8Array(imageBuffer)], "image2.jpg", {
          type: "image/jpeg",
        }),
      ];

      const results = await processImages(files);

      expect(results).toHaveLength(2);
      expect(results[0]?.originalname).toBe("image1.jpg");
      expect(results[1]?.originalname).toBe("image2.jpg");
      expect(results[0]?.mimetype).toBe("image/webp");
      expect(results[1]?.mimetype).toBe("image/webp");
    });

    it("should throw error if any image fails processing", async () => {
      const imageBuffer = await createTestImage(100, 100);

      const files = [
        new File([new Uint8Array(imageBuffer)], "valid.jpg", {
          type: "image/jpeg",
        }),
        new File(["invalid"], "invalid.jpg", {type: "image/jpeg"}),
      ];

      await expect(processImages(files)).rejects.toThrow(
        "Error processing image",
      );
    });

    it("should return empty array for empty input", async () => {
      const results = await processImages([]);
      expect(results).toEqual([]);
    });
  });
});

describe("Upload Middleware", () => {
  describe("createUploadMiddleware", () => {
    it("should return 400 when no files provided", async () => {
      const app = new Hono();
      app.post("/upload", createUploadMiddleware(), (c) => c.json({ok: true}));

      const formData = new FormData();
      const res = await app.request("/upload", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as {type: string; title: string};
      expect(json.type).toBe("NO_FILES");
      expect(json.title).toBe("No files provided");
    });

    it("should accept file with allowed MIME type", async () => {
      interface Variables {
        file: File;
      }
      const app = new Hono<{Variables: Variables}>();
      app.post("/upload", createUploadMiddleware(), (c) => {
        const file = c.get("file");
        return c.json({name: file.name, type: file.type});
      });

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", {type: "image/jpeg"}),
      );

      const res = await app.request("/upload", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(200);
    });
  });

  describe("Helper Functions", () => {
    it("getProcessedFile should return undefined when no processed file", async () => {
      const app = new Hono();
      let processedFile;
      app.get("/test", (c) => {
        processedFile = getProcessedFile(c);
        return c.json({ok: true});
      });

      await app.request("/test");
      expect(processedFile).toBeUndefined();
    });

    it("getProcessedFiles should return undefined when no processed files", async () => {
      const app = new Hono();
      let processedFiles;
      app.get("/test", (c) => {
        processedFiles = getProcessedFiles(c);
        return c.json({ok: true});
      });

      await app.request("/test");
      expect(processedFiles).toBeUndefined();
    });
  });
});
