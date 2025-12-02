import {describe, expect, it} from "vitest";
import {generateCsrfToken, parseToken, validateCsrfToken} from "./token.js";

describe("CSRF Token Functions", () => {
  const testConfig = {
    secret: "test-secret-key",
    tokenLength: 16,
  };

  describe("generateCsrfToken", () => {
    it("should generate a valid token with correct format", () => {
      const sessionId = "user123";
      const token = generateCsrfToken(sessionId, testConfig);

      expect(token).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
      expect(token.split(".")).toHaveLength(2);
    });

    it("should generate different tokens for different sessions", () => {
      const token1 = generateCsrfToken("user1", testConfig);
      const token2 = generateCsrfToken("user2", testConfig);

      expect(token1).not.toBe(token2);
    });

    it("should generate different tokens for same session (different random values)", () => {
      const sessionId = "user123";
      const token1 = generateCsrfToken(sessionId, testConfig);
      const token2 = generateCsrfToken(sessionId, testConfig);

      expect(token1).not.toBe(token2);
    });

    it("should throw error for empty session ID", () => {
      expect(() => generateCsrfToken("", testConfig)).toThrow(
        "Session ID is required for CSRF token generation",
      );
    });

    it("should use correct token length", () => {
      const sessionId = "user123";
      const token = generateCsrfToken(sessionId, testConfig);
      const [, randomValue] = token.split(".");

      expect(randomValue).toHaveLength(testConfig.tokenLength * 2);
    });
  });

  describe("parseToken", () => {
    it("should parse valid token correctly", () => {
      const token = "abc123.def456";
      const parsed = parseToken(token);

      expect(parsed).toEqual({
        hmac: "abc123",
        randomValue: "def456",
      });
    });

    it("should return null for empty token", () => {
      const parsed = parseToken("");
      expect(parsed).toBeNull();
    });

    it("should return null for malformed token (no dot)", () => {
      const parsed = parseToken("invalidtoken");
      expect(parsed).toBeNull();
    });

    it("should return null for malformed token (too many parts)", () => {
      const parsed = parseToken("abc.def.ghi");
      expect(parsed).toBeNull();
    });

    it("should return null for token with empty parts", () => {
      const parsed1 = parseToken(".def456");
      const parsed2 = parseToken("abc123.");
      const parsed3 = parseToken(".");

      expect(parsed1).toBeNull();
      expect(parsed2).toBeNull();
      expect(parsed3).toBeNull();
    });
  });

  describe("validateCsrfToken", () => {
    it("should validate correctly generated token", () => {
      const sessionId = "user123";
      const token = generateCsrfToken(sessionId, testConfig);
      const result = validateCsrfToken(token, sessionId, testConfig);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject token for different session", () => {
      const sessionId1 = "user123";
      const sessionId2 = "user456";
      const token = generateCsrfToken(sessionId1, testConfig);
      const result = validateCsrfToken(token, sessionId2, testConfig);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token signature");
    });

    it("should reject token with different secret", () => {
      const sessionId = "user123";
      const token = generateCsrfToken(sessionId, testConfig);
      const differentConfig = {...testConfig, secret: "different-secret"};
      const result = validateCsrfToken(token, sessionId, differentConfig);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token signature");
    });

    it("should reject empty token", () => {
      const result = validateCsrfToken("", "user123", testConfig);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and session ID are required");
    });

    it("should reject empty session ID", () => {
      const token = "abc123.def456";
      const result = validateCsrfToken(token, "", testConfig);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and session ID are required");
    });

    it("should reject malformed token", () => {
      const result = validateCsrfToken("invalid-token", "user123", testConfig);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token format");
    });

    it("should handle validation errors gracefully", () => {
      const result = validateCsrfToken("abc.def", "user123", {
        ...testConfig,
        secret: "", // Empty secret might cause issues
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token signature");
    });
  });

  describe("Integration tests", () => {
    it("should generate and validate token successfully", () => {
      const sessionId = "integration-test-user";

      const token = generateCsrfToken(sessionId, testConfig);
      expect(token).toBeTruthy();

      const parsed = parseToken(token);
      expect(parsed).toBeTruthy();
      if (!parsed) throw new Error("Parsed token should not be null");
      expect(parsed.hmac).toBeTruthy();
      expect(parsed.randomValue).toBeTruthy();

      const validation = validateCsrfToken(token, sessionId, testConfig);
      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it("should fail validation with tampered token", () => {
      const sessionId = "tamper-test-user";
      const originalToken = generateCsrfToken(sessionId, testConfig);

      const [hmac, randomValue] = originalToken.split(".");
      if (!hmac || !randomValue) throw new Error("Token parts should exist");
      const lastChar = hmac.slice(-1);
      const tamperedLastChar = lastChar === "0" ? "1" : "0";
      const tamperedToken = `${hmac.slice(0, -1)}${tamperedLastChar}.${randomValue}`;

      const validation = validateCsrfToken(
        tamperedToken,
        sessionId,
        testConfig,
      );
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Invalid token signature");
    });
  });
});
