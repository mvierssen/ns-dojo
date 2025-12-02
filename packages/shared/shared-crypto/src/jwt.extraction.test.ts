// Test file with test JWT secrets - sonarjs/no-hardcoded-secrets disabled via eslint config
import {describe, expect, it} from "vitest";
import {extractBearerToken} from "./jwt.js";
import {
  INVALID_AUTH_HEADERS,
  JWT_ERRORS,
  SAMPLE_JWT_TOKEN,
  setupJwtTestEnvironment,
} from "./jwt.test-utils.js";

describe("JWT Token Extraction", () => {
  setupJwtTestEnvironment();

  describe("extractBearerToken", () => {
    it("should extract token from valid Bearer header", () => {
      const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.token.signature";
      const authHeader = `Bearer ${token}`;

      const extracted = extractBearerToken(authHeader);

      expect(extracted).toBe(token);
    });

    it("should throw error for missing authorization header", () => {
      expect(() => extractBearerToken()).toThrow(
        expect.objectContaining(JWT_ERRORS.noToken),
      );
    });

    it("should throw error for empty authorization header", () => {
      expect(() => extractBearerToken("")).toThrow(
        expect.objectContaining(JWT_ERRORS.noToken),
      );
    });

    it("should throw error for non-Bearer authorization header", () => {
      for (const header of INVALID_AUTH_HEADERS) {
        expect(() => extractBearerToken(header)).toThrow(
          expect.objectContaining(JWT_ERRORS.noToken),
        );
      }
    });

    it("should throw error for Bearer header with missing token", () => {
      expect(() => extractBearerToken("Bearer")).toThrow(
        expect.objectContaining(JWT_ERRORS.noToken),
      );
    });

    it("should extract empty token from Bearer header with empty token", () => {
      const result = extractBearerToken("Bearer ");
      expect(result).toBe("");
    });

    it("should extract token with spaces and special characters", () => {
      const authHeader = `Bearer ${SAMPLE_JWT_TOKEN}`;

      const extracted = extractBearerToken(authHeader);

      expect(extracted).toBe(SAMPLE_JWT_TOKEN);
    });
  });
});
