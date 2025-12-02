import {describe, expect, it, vi} from "vitest";
import {ObjectStorage} from "./storage.js";

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(function () {
    return {
      send: vi.fn(() => Promise.resolve()),
    };
  }),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(() =>
    Promise.resolve("https://example.com/presigned-url"),
  ),
}));

describe("ObjectStorage", () => {
  const mockConfig = {
    endpoint: "https://s3.example.com",
    bucketName: "test-bucket",
    accessKeyId: "test-key",
    secretAccessKey: "test-secret",
    publicUrl: "https://cdn.example.com",
  };

  it("should upload file", async () => {
    const storage = new ObjectStorage(mockConfig);
    const buffer = Buffer.from("test content");

    const result = await storage.uploadFile(buffer, "test.txt", "text/plain");

    expect(result).toMatchObject({
      originalname: "test.txt",
      size: buffer.length,
      mimetype: "text/plain",
    });
    expect(result.key).toBeDefined();
    expect(result.url).toBeDefined();
  });

  it("should extract key from URL", () => {
    const url = "https://example.com/folder/file.txt";
    const key = ObjectStorage.extractKeyFromUrl(url);
    expect(key).toBe("folder/file.txt");
  });
});
