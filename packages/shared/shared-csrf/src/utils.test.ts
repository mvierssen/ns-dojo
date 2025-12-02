import {describe, expect, it} from "vitest";
import {
  createHmacSignature,
  createSessionMessage,
  timingSafeEqual,
} from "./utils.js";

describe("CSRF Utils", () => {
  describe("timingSafeEqual", () => {
    it("should return true for identical strings", () => {
      const result = timingSafeEqual("hello", "hello");
      expect(result).toBe(true);
    });

    it("should return false for different strings of same length", () => {
      const result = timingSafeEqual("hello", "world");
      expect(result).toBe(false);
    });

    it("should return false for strings of different length", () => {
      const result = timingSafeEqual("hello", "hi");
      expect(result).toBe(false);
    });

    it("should return true for empty strings", () => {
      const result = timingSafeEqual("", "");
      expect(result).toBe(true);
    });

    it("should handle unicode characters correctly", () => {
      const str1 = "café";
      const str2 = "café";
      const str3 = "cafe";

      expect(timingSafeEqual(str1, str2)).toBe(true);
      expect(timingSafeEqual(str1, str3)).toBe(false);
    });

    it("should be timing-safe (basic test)", () => {
      const longString1 = "a".repeat(1000);
      const longString2 = "a".repeat(999) + "b";

      expect(timingSafeEqual(longString1, longString2)).toBe(false);
    });
  });

  describe("createHmacSignature", () => {
    it("should generate consistent HMAC for same inputs", () => {
      const message = "test message";
      const secret = "test secret";

      const hmac1 = createHmacSignature(message, secret);
      const hmac2 = createHmacSignature(message, secret);

      expect(hmac1).toBe(hmac2);
      expect(hmac1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate different HMAC for different messages", () => {
      const secret = "test secret";
      const hmac1 = createHmacSignature("message1", secret);
      const hmac2 = createHmacSignature("message2", secret);

      expect(hmac1).not.toBe(hmac2);
    });

    it("should generate different HMAC for different secrets", () => {
      const message = "test message";
      const hmac1 = createHmacSignature(message, "secret1");
      const hmac2 = createHmacSignature(message, "secret2");

      expect(hmac1).not.toBe(hmac2);
    });

    it("should handle empty message", () => {
      const hmac = createHmacSignature("", "secret");
      expect(hmac).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should handle empty secret", () => {
      const hmac = createHmacSignature("message", "");
      expect(hmac).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("createSessionMessage", () => {
    it("should create properly formatted session message", () => {
      const sessionId = "user123";
      const randomValue = "abc123";

      const message = createSessionMessage(sessionId, randomValue);

      expect(message).toBe("7!user123!6!abc123");
    });

    it("should handle empty session ID", () => {
      const message = createSessionMessage("", "random");
      expect(message).toBe("0!!6!random");
    });

    it("should handle empty random value", () => {
      const message = createSessionMessage("session", "");
      expect(message).toBe("7!session!0!");
    });

    it("should handle unicode characters in session ID", () => {
      const sessionId = "café";
      const randomValue = "123";

      const message = createSessionMessage(sessionId, randomValue);

      expect(message).toBe("4!café!3!123");
    });

    it("should create different messages for different inputs", () => {
      const message1 = createSessionMessage("user1", "random1");
      const message2 = createSessionMessage("user2", "random2");
      const message3 = createSessionMessage("user1", "random2");

      expect(message1).not.toBe(message2);
      expect(message1).not.toBe(message3);
      expect(message2).not.toBe(message3);
    });

    it("should handle long session IDs and random values", () => {
      const longSessionId = "a".repeat(100);
      const longRandomValue = "b".repeat(200);

      const message = createSessionMessage(longSessionId, longRandomValue);

      expect(message).toContain("100!");
      expect(message).toContain("200!");
      expect(message).toContain(longSessionId);
      expect(message).toContain(longRandomValue);
    });
  });

  describe("Integration tests", () => {
    it("should work together to create and verify signatures", () => {
      const sessionId = "testUser";
      const randomValue = "randomValue123";
      const secret = "testSecret";

      const message = createSessionMessage(sessionId, randomValue);
      const signature1 = createHmacSignature(message, secret);
      const signature2 = createHmacSignature(message, secret);

      expect(timingSafeEqual(signature1, signature2)).toBe(true);

      const differentMessage = createSessionMessage(
        "differentUser",
        randomValue,
      );
      const differentSignature = createHmacSignature(differentMessage, secret);

      expect(timingSafeEqual(signature1, differentSignature)).toBe(false);
    });
  });
});
