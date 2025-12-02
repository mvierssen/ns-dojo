import {describe, expect, it, vi} from "vitest";

describe("Args Utils", () => {
  describe("checkHelpFlag", () => {
    it("should exit with help text when -h is provided", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});

      const {checkHelpFlag} = await import("./args.js");

      expect(() => {
        checkHelpFlag(["-h"], "Help text");
      }).toThrow();
      expect(mockLog).toHaveBeenCalledWith("Help text");
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
      mockLog.mockRestore();
    });

    it("should exit with help text when --help is provided", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});

      const {checkHelpFlag} = await import("./args.js");

      expect(() => {
        checkHelpFlag(["--help"], "Help text");
      }).toThrow();
      expect(mockLog).toHaveBeenCalledWith("Help text");
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
      mockLog.mockRestore();
    });

    it("should not exit when help flag is not provided", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const {checkHelpFlag} = await import("./args.js");

      expect(() => {
        checkHelpFlag(["--other"], "Help text");
      }).not.toThrow();

      mockExit.mockRestore();
    });
  });

  describe("parseEnvironmentAlias", () => {
    it("should parse valid alias", async () => {
      const {parseEnvironmentAlias} = await import("./args.js");

      const result = parseEnvironmentAlias("development=staging");

      expect(result).toEqual({alias: "development", source: "staging"});
    });

    it("should return null for non-alias string", async () => {
      const {parseEnvironmentAlias} = await import("./args.js");

      const result = parseEnvironmentAlias("staging");

      expect(result).toBeNull();
    });

    it("should die on invalid alias format", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const {parseEnvironmentAlias} = await import("./args.js");

      expect(() => parseEnvironmentAlias("=")).toThrow();
      expect(() => parseEnvironmentAlias("alias=")).toThrow();
      expect(() => parseEnvironmentAlias("=source")).toThrow();

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });

  describe("validateFeatureName", () => {
    it("should accept valid feature names", async () => {
      const {validateFeatureName} = await import("./args.js");

      expect(validateFeatureName("my-feature")).toBe(true);
      expect(validateFeatureName("my_feature")).toBe(true);
      expect(validateFeatureName("MyFeature123")).toBe(true);
      expect(validateFeatureName("feature-123-test_v2")).toBe(true);
    });

    it("should reject invalid feature names", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const {validateFeatureName} = await import("./args.js");

      expect(() => validateFeatureName("my feature")).toThrow();
      expect(() => validateFeatureName("my@feature")).toThrow();
      expect(() => validateFeatureName("my.feature")).toThrow();
      expect(() => validateFeatureName("my/feature")).toThrow();

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });

  describe("generateUsage", () => {
    it("should generate usage template", async () => {
      const {generateUsage} = await import("./args.js");

      const result = generateUsage(
        "script.ts",
        "Test script",
        "[options] <arg>",
        "  script.ts --help",
      );

      expect(result).toContain("Usage: script.ts [options] <arg>");
      expect(result).toContain("Test script");
      expect(result).toContain("--help");
      expect(result).toContain("script.ts --help");
    });
  });

  describe("hasFlag", () => {
    it("should return true when flag is present", async () => {
      const {hasFlag} = await import("./args.js");

      expect(hasFlag(["--verbose", "file.txt"], "--verbose")).toBe(true);
      expect(hasFlag(["--verbose", "file.txt"], "--verbose", "-v")).toBe(true);
      expect(hasFlag(["-v", "file.txt"], "--verbose", "-v")).toBe(true);
    });

    it("should return false when flag is not present", async () => {
      const {hasFlag} = await import("./args.js");

      expect(hasFlag(["file.txt"], "--verbose")).toBe(false);
      expect(hasFlag(["--other", "file.txt"], "--verbose")).toBe(false);
    });
  });

  describe("getFlag", () => {
    it("should return flag value", async () => {
      const {getFlag} = await import("./args.js");

      expect(getFlag(["--limit", "10"], "--limit")).toBe("10");
      expect(getFlag(["-l", "5"], "-l", "--limit")).toBe("5");
    });

    it("should return null when flag not found", async () => {
      const {getFlag} = await import("./args.js");

      expect(getFlag(["file.txt"], "--limit")).toBeNull();
      expect(getFlag(["--other"], "--limit")).toBeNull();
    });

    it("should return null when flag has no value", async () => {
      const {getFlag} = await import("./args.js");

      expect(getFlag(["--limit"], "--limit")).toBeNull();
    });
  });

  describe("getRemainingArgs", () => {
    it("should return non-flag arguments", async () => {
      const {getRemainingArgs} = await import("./args.js");

      const result = getRemainingArgs(
        ["--limit", "10", "file1.txt", "file2.txt"],
        "--limit",
      );

      expect(result).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should handle multiple flags with values", async () => {
      const {getRemainingArgs} = await import("./args.js");

      const result = getRemainingArgs(
        ["--limit", "10", "file1.txt", "--verbose", "true", "file2.txt"],
        "--limit",
        "--verbose",
      );

      expect(result).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should handle boolean flags", async () => {
      const {getRemainingArgs} = await import("./args.js");

      const result = getRemainingArgs(["file1.txt", "file2.txt"], "--limit");

      expect(result).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should return empty array when no arguments", async () => {
      const {getRemainingArgs} = await import("./args.js");

      const result = getRemainingArgs(["--limit", "10"], "--limit");

      expect(result).toEqual([]);
    });
  });
});
