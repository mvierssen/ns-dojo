import {describe, expect, it} from "vitest";

describe("Git Utils", () => {
  describe("gitBranchExistsLocal", () => {
    it("should be defined", async () => {
      const {gitBranchExistsLocal} = await import("./git-utils.js");
      expect(gitBranchExistsLocal).toBeDefined();
      expect(typeof gitBranchExistsLocal).toBe("function");
    });

    it("should return boolean for current branch", async () => {
      const {gitBranchExistsLocal, gitCurrentBranch} = await import(
        "./git-utils.js"
      );

      const currentBranch = await gitCurrentBranch();
      if (currentBranch) {
        const result = await gitBranchExistsLocal(currentBranch);
        expect(typeof result).toBe("boolean");
      }
    });

    it("should return false for non-existent branch", async () => {
      const {gitBranchExistsLocal} = await import("./git-utils.js");
      const result = await gitBranchExistsLocal("nonexistent-branch-12345678");
      expect(result).toBe(false);
    });
  });

  describe("gitBranchExistsRemote", () => {
    it("should be defined", async () => {
      const {gitBranchExistsRemote} = await import("./git-utils.js");
      expect(gitBranchExistsRemote).toBeDefined();
      expect(typeof gitBranchExistsRemote).toBe("function");
    });

    it("should return boolean", async () => {
      const {gitBranchExistsRemote} = await import("./git-utils.js");
      const result = await gitBranchExistsRemote(
        "origin",
        "nonexistent-branch-12345678",
      );
      expect(typeof result).toBe("boolean");
    });
  });

  describe("gitCurrentBranch", () => {
    it("should return a string", async () => {
      const {gitCurrentBranch} = await import("./git-utils.js");
      const result = await gitCurrentBranch();
      expect(typeof result).toBe("string");
    });
  });

  describe("getGitRoot", () => {
    it("should return git root directory", async () => {
      const {getGitRoot} = await import("./path-utils.js");
      const result = await getGitRoot();

      expect(result).not.toBeNull();
      if (result) {
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
        // Should be an absolute path
        expect(result.startsWith("/")).toBe(true);
      }
    });
  });
});
