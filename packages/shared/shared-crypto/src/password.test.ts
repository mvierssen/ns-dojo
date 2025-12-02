import {beforeAll, describe, expect, it} from "vitest";
import {DEFAULT_SALT_ROUNDS, hashPassword, verifyPassword} from "./password.js";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password with default salt rounds", async () => {
      const password = "test-password-123";

      const hashedPassword = await hashPassword(password);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
    });

    it("should hash password with custom salt rounds", async () => {
      const password = "custom-salt-password";
      const customSaltRounds = 8;

      const hashedPassword = await hashPassword(password, customSaltRounds);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
      expect(
        hashedPassword.includes(
          `$2b$${String(customSaltRounds).padStart(2, "0")}$`,
        ),
      ).toBe(true);
    });

    it("should generate different hashes for same password", async () => {
      const password = "same-password";

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBe(hash2.length);
      expect(hash1.startsWith("$2b$")).toBe(true);
      expect(hash2.startsWith("$2b$")).toBe(true);
    });

    it("should handle empty password", async () => {
      const emptyPassword = "";

      const hashedPassword = await hashPassword(emptyPassword);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it("should handle very long passwords", async () => {
      const longPassword = "a".repeat(1000);

      const hashedPassword = await hashPassword(longPassword);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it("should handle passwords with special characters", async () => {
      const specialPassword = "pā$$w0rd!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

      const hashedPassword = await hashPassword(specialPassword);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
      expect(hashedPassword).not.toBe(specialPassword);
    });

    it("should use DEFAULT_SALT_ROUNDS when no salt rounds specified", async () => {
      const password = "default-rounds-test";

      const hashedPassword = await hashPassword(password);

      expect(
        hashedPassword.includes(`$2b$${String(DEFAULT_SALT_ROUNDS)}$`),
      ).toBe(true);
    });

    it("should handle different salt round values", async () => {
      const password = "salt-rounds-test";
      const saltRoundsToTest = [4, 6, 8, 10, 14];

      for (const rounds of saltRoundsToTest) {
        const hashedPassword = await hashPassword(password, rounds);

        expect(hashedPassword.startsWith("$2b$")).toBe(true);
        expect(
          hashedPassword.includes(`$2b$${String(rounds).padStart(2, "0")}$`),
        ).toBe(true);
      }
    });
  });

  describe("verifyPassword", () => {
    const testPassword = "verify-test-password";
    let testHash: string;

    beforeAll(async () => {
      testHash = await hashPassword(testPassword);
    });

    it("should verify correct password against its hash", async () => {
      const isValid = await verifyPassword(testPassword, testHash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const wrongPassword = "wrong-password";

      const isValid = await verifyPassword(wrongPassword, testHash);

      expect(isValid).toBe(false);
    });

    it("should reject empty password against valid hash", async () => {
      const emptyPassword = "";

      const isValid = await verifyPassword(emptyPassword, testHash);

      expect(isValid).toBe(false);
    });

    it("should handle empty password with empty hash", async () => {
      const emptyPassword = "";
      const emptyHash = await hashPassword(emptyPassword);

      const isValid = await verifyPassword(emptyPassword, emptyHash);

      expect(isValid).toBe(true);
    });

    it("should reject password against invalid hash format", async () => {
      const invalidHashes = [
        "invalid-hash",
        "$2b$invalid",
        "",
        "plaintext-not-hash",
        "$2a$10$invalid", // wrong bcrypt version
      ];

      for (const invalidHash of invalidHashes) {
        const isValid = await verifyPassword(testPassword, invalidHash);
        expect(isValid).toBe(false);
      }
    });

    it("should handle case sensitivity", async () => {
      const lowerCasePassword = "password";
      const upperCasePassword = "PASSWORD";
      const mixedCasePassword = "PaSSwoRd";

      const lowerHash = await hashPassword(lowerCasePassword);

      expect(await verifyPassword(lowerCasePassword, lowerHash)).toBe(true);
      expect(await verifyPassword(upperCasePassword, lowerHash)).toBe(false);
      expect(await verifyPassword(mixedCasePassword, lowerHash)).toBe(false);
    });

    it("should handle passwords with whitespace", async () => {
      const passwordWithSpaces = " password with spaces ";
      const trimmedPassword = "password with spaces";

      const hashWithSpaces = await hashPassword(passwordWithSpaces);

      expect(await verifyPassword(passwordWithSpaces, hashWithSpaces)).toBe(
        true,
      );
      expect(await verifyPassword(trimmedPassword, hashWithSpaces)).toBe(false);
    });

    it("should handle special characters in password verification", async () => {
      const specialPassword = "pā$$w0rd!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
      const specialHash = await hashPassword(specialPassword);

      expect(await verifyPassword(specialPassword, specialHash)).toBe(true);
      expect(
        await verifyPassword("similar-but-different!@#", specialHash),
      ).toBe(false);
    });

    it("should handle very long passwords in verification", async () => {
      const longPassword = "a".repeat(1000);
      const longHash = await hashPassword(longPassword);

      expect(await verifyPassword(longPassword, longHash)).toBe(true);
      expect(await verifyPassword("b".repeat(1000), longHash)).toBe(false);
    });

    it("should verify passwords hashed with different salt rounds", async () => {
      const password = "multi-salt-test";
      const saltRounds = [4, 8, 12, 14];

      for (const rounds of saltRounds) {
        const hash = await hashPassword(password, rounds);
        const isValid = await verifyPassword(password, hash);

        expect(isValid).toBe(true);
      }
    });
  });

  describe("integration tests", () => {
    it("should work end-to-end: hash -> verify cycle", async () => {
      const originalPassword = "integration-test-password";

      const hashedPassword = await hashPassword(originalPassword);

      const isValidCorrect = await verifyPassword(
        originalPassword,
        hashedPassword,
      );
      expect(isValidCorrect).toBe(true);

      const isValidIncorrect = await verifyPassword(
        "wrong-password",
        hashedPassword,
      );
      expect(isValidIncorrect).toBe(false);
    });

    it("should handle multiple hash-verify cycles with same password", async () => {
      const password = "multiple-cycles-test";
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);

        expect(isValid).toBe(true);
      }
    });

    it("should handle rapid successive hash operations", async () => {
      const passwords = ["rapid1", "rapid2", "rapid3", "rapid4", "rapid5"];

      const hashes = await Promise.all(
        passwords.map((pwd) => hashPassword(pwd)),
      );

      const verifications = await Promise.all(
        passwords.map((pwd, i) => {
          const hash = hashes[i];
          if (!hash)
            throw new Error(`Hash not found for password ${String(i)}`);
          return verifyPassword(pwd, hash);
        }),
      );

      expect(verifications.every(Boolean)).toBe(true);

      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(passwords.length);
    });
  });
});
