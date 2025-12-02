import {mkdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, describe, expect, it} from "vitest";

describe("Config Utils", () => {
  let tempDir: string;
  const originalEnv = {...process.env};

  beforeEach(async () => {
    tempDir = join(tmpdir(), `test-config-${String(Date.now())}`);
    await mkdir(tempDir, {recursive: true});
    process.env = {...originalEnv};
  });

  afterEach(async () => {
    try {
      await rm(tempDir, {recursive: true, force: true});
    } catch {
      // Ignore cleanup errors
    }
    process.env = originalEnv;
  });

  describe("loadConfig", () => {
    it("should load JSON config", async () => {
      const configPath = join(tempDir, "config.json");
      const config = {key1: "value1", key2: "value2"};
      await writeFile(configPath, JSON.stringify(config));

      const {loadConfig} = await import("./config.js");
      const result = await loadConfig(configPath);

      expect(result).toEqual(config);
    });

    it("should load KEY=VALUE config", async () => {
      const configPath = join(tempDir, "config.env");
      const configContent = `KEY1=value1
KEY2=value2
# Comment
KEY3="quoted value"
`;
      await writeFile(configPath, configContent);

      const {loadConfig} = await import("./config.js");
      const result = await loadConfig(configPath);

      expect(result).toEqual({
        KEY1: "value1",
        KEY2: "value2",
        KEY3: "quoted value",
      });
    });

    it("should return empty object for non-existent file", async () => {
      const {loadConfig} = await import("./config.js");
      const result = await loadConfig("/nonexistent/config.json");

      expect(result).toEqual({});
    });

    it("should handle empty config file", async () => {
      const configPath = join(tempDir, "empty.conf");
      await writeFile(configPath, "");

      const {loadConfig} = await import("./config.js");
      const result = await loadConfig(configPath);

      expect(result).toEqual({});
    });
  });

  describe("detectAndSetKubeconfig", () => {
    it("should use existing KUBECONFIG from environment", async () => {
      process.env.KUBECONFIG = "/path/to/kubeconfig";

      const {detectAndSetKubeconfig} = await import("./config.js");
      const result = await detectAndSetKubeconfig();

      expect(result).toBe("/path/to/kubeconfig");
    });

    it("should return null when no infrastructure directory found", async () => {
      delete process.env.KUBECONFIG;
      delete process.env.PLATFORM_ROOT;

      // Change to temp directory so getPlatformRoot() won't find the real platform
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const {detectAndSetKubeconfig} = await import("./config.js");
        const result = await detectAndSetKubeconfig();

        expect(result).toBeNull();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("getSopsKeyHierarchical", () => {
    it("should return key from environment variable", async () => {
      process.env.SOPS_AGE_KEY = "test-private-key";

      const {getSopsKeyHierarchical} = await import("./config.js");
      const result = await getSopsKeyHierarchical("private", "staging");

      expect(result).toBe("test-private-key");
    });

    it("should return public key from environment", async () => {
      process.env.SOPS_AGE_PUBLIC_KEY = "test-public-key";

      const {getSopsKeyHierarchical} = await import("./config.js");
      const result = await getSopsKeyHierarchical("public", "staging");

      expect(result).toBe("test-public-key");
    });

    it("should prefer SOPS_AGE_KEY over AGE_KEY", async () => {
      process.env.SOPS_AGE_KEY = "sops-key";
      process.env.AGE_KEY = "age-key";

      const {getSopsKeyHierarchical} = await import("./config.js");
      const result = await getSopsKeyHierarchical("private", "staging");

      expect(result).toBe("sops-key");
    });

    it("should return null when no key sources available", async () => {
      delete process.env.SOPS_AGE_KEY;
      delete process.env.AGE_KEY;
      delete process.env.SOPS_AGE_PUBLIC_KEY;
      delete process.env.PLATFORM_ROOT;
      delete process.env.HOME;
      delete process.env.USERPROFILE;

      // Change to temp directory so getPlatformRoot() won't find the real platform
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const {getSopsKeyHierarchical} = await import("./config.js");
        const result = await getSopsKeyHierarchical("private", "staging");

        expect(result).toBeNull();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("getSopsKeyFromTerraform", () => {
    it("should return null when PLATFORM_ROOT not set", async () => {
      delete process.env.PLATFORM_ROOT;

      const {getSopsKeyFromTerraform} = await import("./config.js");
      const result = await getSopsKeyFromTerraform("private", "staging");

      expect(result).toBeNull();
    });

    it("should return null when terraform directory does not exist", async () => {
      process.env.PLATFORM_ROOT = tempDir;

      const {getSopsKeyFromTerraform} = await import("./config.js");
      const result = await getSopsKeyFromTerraform("private", "staging");

      expect(result).toBeNull();
    });
  });

  describe("getSopsKeyFromLocal", () => {
    it("should return null when home directory not set", async () => {
      delete process.env.HOME;
      delete process.env.USERPROFILE;

      const {getSopsKeyFromLocal} = await import("./config.js");
      const result = await getSopsKeyFromLocal("private");

      expect(result).toBeNull();
    });

    it("should return null for public key (not implemented)", async () => {
      const {getSopsKeyFromLocal} = await import("./config.js");
      const result = await getSopsKeyFromLocal("public");

      expect(result).toBeNull();
    });

    it("should extract age key from local file", async () => {
      const homeDir = join(tempDir, "home");
      const ageKeysDir = join(homeDir, ".config", "sops", "age");
      const ageKeysFile = join(ageKeysDir, "keys.txt");

      await mkdir(ageKeysDir, {recursive: true});
      await writeFile(
        ageKeysFile,
        `# age key file
# Created: 2024-01-01
AGE-SECRET-KEY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
# Another comment
`,
      );

      process.env.HOME = homeDir;

      const {getSopsKeyFromLocal} = await import("./config.js");
      const result = await getSopsKeyFromLocal("private");

      expect(result).toContain("AGE-SECRET-KEY");
    });

    it("should return null when age keys file does not exist", async () => {
      process.env.HOME = tempDir;

      const {getSopsKeyFromLocal} = await import("./config.js");
      const result = await getSopsKeyFromLocal("private");

      expect(result).toBeNull();
    });
  });

  describe("getSopsKeyFromKubeconfig", () => {
    it("should return null (not implemented)", async () => {
      const {getSopsKeyFromKubeconfig} = await import("./config.js");
      const result = await getSopsKeyFromKubeconfig("private", "staging");

      expect(result).toBeNull();
    });
  });
});
