import {beforeEach, describe, expect, it, vi} from "vitest";

type ExecCallback = (
  error: Error | null,
  result: {stdout: string; stderr: string},
) => void;

// Create mock exec function that will be used by promisify
const mockExec = vi.fn();

// Mock the entire child_process module
vi.mock("node:child_process", () => ({
  exec: mockExec,
}));

// Mock util.promisify to properly wrap our callback-based mock
vi.mock("node:util", () => ({
  promisify: (fn: (...args: unknown[]) => unknown) => {
    return (...args: unknown[]) => {
      return new Promise((resolve, reject) => {
        fn(
          ...args,
          (error: Error | null, result: {stdout: string; stderr: string}) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
      });
    };
  },
}));

describe("Git Utils (Unit Tests)", () => {
  beforeEach(() => {
    mockExec.mockClear();
  });

  describe("gitBranchExistsLocal", () => {
    it("should return true when branch exists", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "", stderr: ""});
        return {};
      });

      const {gitBranchExistsLocal} = await import("./git-utils.js");
      const result = await gitBranchExistsLocal("main");

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        "git rev-parse --verify main",
        expect.any(Function),
      );
    });

    it("should return false when branch does not exist", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error("branch not found"), {stdout: "", stderr: ""});
        return {};
      });

      const {gitBranchExistsLocal} = await import("./git-utils.js");
      const result = await gitBranchExistsLocal("nonexistent");

      expect(result).toBe(false);
    });

    it("should handle command with special characters", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "", stderr: ""});
        return {};
      });

      const {gitBranchExistsLocal} = await import("./git-utils.js");
      await gitBranchExistsLocal("feature/test-branch");

      expect(mockExec).toHaveBeenCalledWith(
        "git rev-parse --verify feature/test-branch",
        expect.any(Function),
      );
    });
  });

  describe("gitBranchExistsRemote", () => {
    it("should return true when remote branch exists", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "ref exists", stderr: ""});
        return {};
      });

      const {gitBranchExistsRemote} = await import("./git-utils.js");
      const result = await gitBranchExistsRemote("origin", "main");

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        "git ls-remote --exit-code --heads origin main",
        expect.any(Function),
      );
    });

    it("should return false when remote branch does not exist", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error("not found"), {stdout: "", stderr: ""});
        return {};
      });

      const {gitBranchExistsRemote} = await import("./git-utils.js");
      const result = await gitBranchExistsRemote("origin", "nonexistent");

      expect(result).toBe(false);
    });

    it("should handle different remote names", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "ref", stderr: ""});
        return {};
      });

      const {gitBranchExistsRemote} = await import("./git-utils.js");
      await gitBranchExistsRemote("upstream", "develop");

      expect(mockExec).toHaveBeenCalledWith(
        "git ls-remote --exit-code --heads upstream develop",
        expect.any(Function),
      );
    });
  });

  describe("gitCurrentBranch", () => {
    it("should return current branch name", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "feature-branch\n", stderr: ""});
        return {};
      });

      const {gitCurrentBranch} = await import("./git-utils.js");
      const result = await gitCurrentBranch();

      expect(result).toBe("feature-branch");
      expect(mockExec).toHaveBeenCalledWith(
        "git branch --show-current",
        expect.any(Function),
      );
    });

    it("should trim whitespace from branch name", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "  main  \n", stderr: ""});
        return {};
      });

      const {gitCurrentBranch} = await import("./git-utils.js");
      const result = await gitCurrentBranch();

      expect(result).toBe("main");
    });

    it("should return empty string on error", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error("not a git repo"), {stdout: "", stderr: ""});
        return {};
      });

      const {gitCurrentBranch} = await import("./git-utils.js");
      const result = await gitCurrentBranch();

      expect(result).toBe("");
    });

    it("should handle detached HEAD state", async () => {
      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, {stdout: "", stderr: ""});
        return {};
      });

      const {gitCurrentBranch} = await import("./git-utils.js");
      const result = await gitCurrentBranch();

      expect(result).toBe("");
    });
  });
});
