// Test file with test JWT secrets - sonarjs/no-hardcoded-secrets disabled via eslint config
import {describe, expect, it} from "vitest";
import type {JwtError} from "./errors.js";
import {generateToken, verifyToken} from "./jwt.js";
import {
  JWT_ERRORS,
  setupJwtTestEnvironment,
  TEST_PAYLOADS,
  TEST_SECRETS,
  USER_ROLES,
} from "./jwt.test-utils.js";

describe("JWT Token Generation", () => {
  setupJwtTestEnvironment();

  describe("generateToken", () => {
    it("should generate token with custom config", async () => {
      const {user_id, role} = TEST_PAYLOADS.admin;

      const token = await generateToken(user_id, role, {
        secret: TEST_SECRETS.custom,
        expiresIn: "1h",
      });

      const payload = await verifyToken(token, TEST_SECRETS.custom);
      expect(payload.user_id).toBe(user_id);
      expect(payload.role).toBe(role);
    });

    it("should throw error when JWT_SECRET not configured", async () => {
      delete process.env.JWT_SECRET;

      await expect(generateToken("user123", "user")).rejects.toThrow(
        expect.objectContaining(
          JWT_ERRORS.noSecret satisfies Partial<JwtError>,
        ),
      );
    });

    it("should generate tokens for different user roles", async () => {
      const {user_id} = TEST_PAYLOADS.user;

      for (const role of USER_ROLES) {
        const token = await generateToken(user_id, role);
        const payload = await verifyToken(token);

        expect(payload.user_id).toBe(user_id);
        expect(payload.role).toBe(role);
      }
    });

    it("should generate tokens with additional claims", async () => {
      const {user_id, role} = TEST_PAYLOADS.user;
      const additionalClaims = {
        department: "engineering",
        permissions: ["read", "write"],
      };

      const token = await generateToken(
        user_id,
        role,
        undefined,
        additionalClaims,
      );
      const payload = await verifyToken(token);

      expect(payload.user_id).toBe(user_id);
      expect(payload.role).toBe(role);
      expect(payload.department).toBe("engineering");
      expect(payload.permissions).toEqual(["read", "write"]);
    });
  });
});
