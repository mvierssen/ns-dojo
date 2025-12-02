import {describe, expect, it} from "vitest";
import {
  getOS,
  getPlatformCommand,
  isLinux,
  isMacOS,
  isWindows,
} from "./platform.js";

describe("Platform", () => {
  describe("OS detection", () => {
    it("should detect current platform", () => {
      const os = getOS();
      expect(["darwin", "linux", "win32"]).toContain(os);
    });

    it("should have exactly one OS check return true", () => {
      const checks = [isMacOS(), isLinux(), isWindows()];
      const trueCount = checks.filter(Boolean).length;
      expect(trueCount).toBe(1);
    });

    it("isMacOS should match process.platform", () => {
      const expected = process.platform === "darwin";
      expect(isMacOS()).toBe(expected);
    });

    it("isLinux should match process.platform", () => {
      const expected = process.platform === "linux";
      expect(isLinux()).toBe(expected);
    });

    it("isWindows should match process.platform", () => {
      const expected = process.platform === "win32";
      expect(isWindows()).toBe(expected);
    });
  });

  describe("getPlatformCommand", () => {
    it("should return macOS command on darwin", () => {
      if (process.platform === "darwin") {
        expect(getPlatformCommand("mac-cmd", "linux-cmd", "win-cmd")).toBe(
          "mac-cmd",
        );
      }
    });

    it("should return Linux command on linux", () => {
      if (process.platform === "linux") {
        expect(getPlatformCommand("mac-cmd", "linux-cmd", "win-cmd")).toBe(
          "linux-cmd",
        );
      }
    });

    it("should return Windows command on win32", () => {
      if (process.platform === "win32") {
        expect(getPlatformCommand("mac-cmd", "linux-cmd", "win-cmd")).toBe(
          "win-cmd",
        );
      }
    });

    it("should return Linux command as fallback when no Windows command provided", () => {
      if (process.platform === "win32") {
        expect(getPlatformCommand("mac-cmd", "linux-cmd")).toBe("linux-cmd");
      }
    });

    it("should handle all three platforms", () => {
      const result = getPlatformCommand("mac", "linux", "windows");
      expect(["mac", "linux", "windows"]).toContain(result);
    });
  });
});
