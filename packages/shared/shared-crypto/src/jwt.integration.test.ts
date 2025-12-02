// Test file with test JWT secrets - sonarjs/no-hardcoded-secrets disabled via eslint config
import {describe, expect, it} from "vitest";
import {
  extractAndVerifyToken,
  extractBearerToken,
  generateToken,
  verifyToken,
} from "./jwt.js";
import {setupJwtTestEnvironment, TEST_PAYLOADS} from "./jwt.test-utils.js";

describe("JWT Integration Tests", () => {
  setupJwtTestEnvironment();

  describe("integration tests", () => {
    it("should work end-to-end: generate -> extract -> verify", async () => {
      const {user_id, role} = TEST_PAYLOADS.moderator;

      const token = await generateToken(user_id, role);

      const authHeader = `Bearer ${token}`;
      const extractedToken = extractBearerToken(authHeader);

      const payload = await verifyToken(extractedToken);

      expect(payload.user_id).toBe(user_id);
      expect(payload.role).toBe(role);
    });

    it("should work with extractAndVerifyToken end-to-end", async () => {
      const {user_id, role} = TEST_PAYLOADS.e2e;

      const token = await generateToken(user_id, role);
      const authHeader = `Bearer ${token}`;

      const payload = await extractAndVerifyToken(authHeader);

      expect(payload.user_id).toBe(user_id);
      expect(payload.role).toBe(role);
    });

    it("should work with custom role types", async () => {
      type ProjectRole = "contributor" | "maintainer" | "admin";
      const customPayload = {
        user_id: "dev123",
        role: "maintainer" as ProjectRole,
      };

      const token = await generateToken(
        customPayload.user_id,
        customPayload.role,
      );
      const authHeader = `Bearer ${token}`;

      const payload = await extractAndVerifyToken<ProjectRole>(authHeader);

      expect(payload.user_id).toBe(customPayload.user_id);
      expect(payload.role).toBe(customPayload.role);
    });
  });
});
