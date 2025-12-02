// Test file with test JWT secrets - sonarjs/no-hardcoded-secrets disabled via eslint config
import {beforeEach, describe, expect, it} from "vitest";
import {generateToken, verifyToken} from "./jwt.js";
import {
  JWT_ERRORS,
  MALFORMED_TOKENS,
  setupJwtTestEnvironment,
  TEST_PAYLOADS,
  TEST_SECRETS,
} from "./jwt.test-utils.js";
import type {JwtPayload} from "./types.js";

describe("JWT Token Verification", () => {
  setupJwtTestEnvironment();

  describe("verifyToken", () => {
    let validToken: string;
    const testPayload: JwtPayload = TEST_PAYLOADS.user;

    beforeEach(async () => {
      validToken = await generateToken(testPayload.user_id, testPayload.role);
    });

    it("should verify a valid token and return payload", async () => {
      const payload = await verifyToken(validToken);

      expect(payload.user_id).toBe(testPayload.user_id);
      expect(payload.role).toBe(testPayload.role);
    });

    it("should verify token with custom secret", async () => {
      const customToken = await generateToken(
        testPayload.user_id,
        testPayload.role,
        {secret: TEST_SECRETS.verification},
      );

      const payload = await verifyToken(customToken, TEST_SECRETS.verification);

      expect(payload.user_id).toBe(testPayload.user_id);
      expect(payload.role).toBe(testPayload.role);
    });

    it("should throw error for invalid token", async () => {
      const invalidToken = "invalid.jwt.token";

      await expect(verifyToken(invalidToken)).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.invalidToken),
      );
    });

    it("should throw error for token with wrong secret", async () => {
      await expect(verifyToken(validToken, TEST_SECRETS.wrong)).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.invalidToken),
      );
    });

    it("should throw error when JWT_SECRET not configured", async () => {
      delete process.env.JWT_SECRET;

      await expect(verifyToken(validToken)).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.noSecret),
      );
    });

    it("should throw error for malformed token", async () => {
      for (const token of MALFORMED_TOKENS) {
        await expect(verifyToken(token)).rejects.toThrow(
          expect.objectContaining(JWT_ERRORS.invalidToken),
        );
      }
    });
  });
});
