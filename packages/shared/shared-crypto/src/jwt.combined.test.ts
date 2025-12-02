// Test file with test JWT secrets - sonarjs/no-hardcoded-secrets disabled via eslint config
import {beforeEach, describe, expect, it} from "vitest";
import {extractAndVerifyToken, generateToken} from "./jwt.js";
import {
  JWT_ERRORS,
  setupJwtTestEnvironment,
  TEST_PAYLOADS,
  TEST_SECRETS,
} from "./jwt.test-utils.js";
import type {JwtPayload} from "./types.js";

describe("JWT Combined Operations", () => {
  setupJwtTestEnvironment();

  describe("extractAndVerifyToken", () => {
    let validToken: string;
    const testPayload: JwtPayload = TEST_PAYLOADS.admin;

    beforeEach(async () => {
      validToken = await generateToken(testPayload.user_id, testPayload.role);
    });

    it("should extract and verify valid Bearer token", async () => {
      const authHeader = `Bearer ${validToken}`;

      const payload = await extractAndVerifyToken(authHeader);

      expect(payload.user_id).toBe(testPayload.user_id);
      expect(payload.role).toBe(testPayload.role);
    });

    it("should extract and verify token with custom secret", async () => {
      const customToken = await generateToken(
        testPayload.user_id,
        testPayload.role,
        {secret: TEST_SECRETS.extractVerify},
      );
      const authHeader = `Bearer ${customToken}`;

      const payload = await extractAndVerifyToken(
        authHeader,
        TEST_SECRETS.extractVerify,
      );

      expect(payload.user_id).toBe(testPayload.user_id);
      expect(payload.role).toBe(testPayload.role);
    });

    it("should throw error for missing Bearer prefix", async () => {
      await expect(extractAndVerifyToken("just-a-token")).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.noToken),
      );
    });

    it("should throw error for invalid token format", async () => {
      const authHeader = "Bearer invalid.token.format";

      await expect(extractAndVerifyToken(authHeader)).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.invalidToken),
      );
    });

    it("should throw error for undefined auth header", async () => {
      await expect(extractAndVerifyToken()).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.noToken),
      );
    });

    it("should handle token verification failure", async () => {
      const validFormatButWrongSignature =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.wrong_signature";
      const authHeader = `Bearer ${validFormatButWrongSignature}`;

      await expect(extractAndVerifyToken(authHeader)).rejects.toThrow(
        expect.objectContaining(JWT_ERRORS.invalidToken),
      );
    });

    it("should work with generic role types", async () => {
      type DatabaseRole = "reader" | "writer" | "admin";
      const customPayload = {user_id: "db123", role: "writer" as DatabaseRole};

      const token = await generateToken(
        customPayload.user_id,
        customPayload.role,
      );
      const authHeader = `Bearer ${token}`;

      const payload = await extractAndVerifyToken<DatabaseRole>(authHeader);

      expect(payload.user_id).toBe(customPayload.user_id);
      expect(payload.role).toBe(customPayload.role);
    });
  });
});
