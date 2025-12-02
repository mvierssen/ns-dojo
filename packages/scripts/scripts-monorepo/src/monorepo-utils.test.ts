import {mkdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {compareLists, difference, isConfigPackage} from "./monorepo-utils.js";

describe("Monorepo Utils", () => {
  describe("isConfigPackage", () => {
    it("should identify ts-config packages", () => {
      expect(isConfigPackage("ts-config-base")).toBe(true);
      expect(isConfigPackage("ts-config-lib-compiled")).toBe(true);
      expect(isConfigPackage("ts-config-react")).toBe(true);
    });

    it("should identify eslint-config packages", () => {
      expect(isConfigPackage("eslint-config-base")).toBe(true);
      expect(isConfigPackage("eslint-config-node")).toBe(true);
      expect(isConfigPackage("eslint-config-react")).toBe(true);
    });

    it("should identify other config packages", () => {
      expect(isConfigPackage("vitest-config-node")).toBe(true);
      expect(isConfigPackage("vite-config-react")).toBe(true);
      expect(isConfigPackage("astro-config-base")).toBe(true);
      expect(isConfigPackage("next-config")).toBe(true);
      expect(isConfigPackage("prettier-config")).toBe(true);
      expect(isConfigPackage("stryker-config")).toBe(true);
    });

    it("should not identify non-config packages", () => {
      expect(isConfigPackage("shared-core")).toBe(false);
      expect(isConfigPackage("shared-logging")).toBe(false);
      expect(isConfigPackage("ns-dojo-web")).toBe(false);
    });

    it("should handle edge cases", () => {
      // Doesn't end with hyphen
      expect(isConfigPackage("ts-config")).toBe(false);
      // Wrong order
      expect(isConfigPackage("config-ts-base")).toBe(false);
      // Partial match
      expect(isConfigPackage("eslint-config")).toBe(false);
    });
  });

  describe("difference", () => {
    it("should return items in first list but not in second", () => {
      const list1 = ["a", "b", "c", "d"];
      const list2 = ["b", "c", "e", "f"];

      const result = difference(list1, list2);

      expect(result).toHaveLength(2);
      expect(result).toContain("a");
      expect(result).toContain("d");
      expect(result).not.toContain("b");
      expect(result).not.toContain("c");
    });

    it("should return empty array when all items are in second list", () => {
      const list1 = ["a", "b"];
      const list2 = ["a", "b", "c"];

      expect(difference(list1, list2)).toEqual([]);
    });

    it("should return all items when second list is empty", () => {
      const list1 = ["a", "b"];
      const list2: string[] = [];

      expect(difference(list1, list2)).toEqual(["a", "b"]);
    });

    it("should handle empty first list", () => {
      const list1: string[] = [];
      const list2 = ["a", "b"];

      expect(difference(list1, list2)).toEqual([]);
    });

    it("should work with string numbers", () => {
      const list1 = ["1", "2", "3", "4"];
      const list2 = ["2", "3", "5"];

      const result = difference(list1, list2);

      expect(result).toContain("1");
      expect(result).toContain("4");
      expect(result).not.toContain("2");
      expect(result).not.toContain("3");
    });
  });

  describe("compareLists", () => {
    it("should return null when lists are identical", () => {
      const list1 = ["a", "b", "c"];
      const list2 = ["a", "b", "c"];

      const result = compareLists(list1, list2, "list1", "list2");

      expect(result).toBeNull();
    });

    it("should show missing items", () => {
      const list1 = ["a", "b", "c"];
      const list2 = ["a", "b"];

      const result = compareLists(list1, list2, "list1", "list2");

      expect(result).not.toBeNull();
      expect(result).toContain("Missing in list2");
      expect(result).toContain("- c");
    });

    it("should show extra items", () => {
      const list1 = ["a", "b"];
      const list2 = ["a", "b", "c"];

      const result = compareLists(list1, list2, "list1", "list2");

      expect(result).not.toBeNull();
      expect(result).toContain("Extra in list2");
      expect(result).toContain("+ c");
    });

    it("should show both missing and extra items", () => {
      const list1 = ["a", "b", "c"];
      const list2 = ["b", "c", "d"];

      const result = compareLists(list1, list2, "list1", "list2");

      expect(result).not.toBeNull();
      expect(result).toContain("Missing in list2");
      expect(result).toContain("- a");
      expect(result).toContain("Extra in list2");
      expect(result).toContain("+ d");
    });

    it("should use provided list names in output", () => {
      const list1 = ["a"];
      const list2 = ["b"];

      const result = compareLists(list1, list2, "dependencies", "package.json");

      expect(result).toContain("package.json");
    });
  });

  describe("integration with temporary files", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = join(tmpdir(), `test-monorepo-${String(Date.now())}`);
      await mkdir(tempDir, {recursive: true});
    });

    afterEach(async () => {
      try {
        await rm(tempDir, {recursive: true, force: true});
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should parse package.json dependencies", async () => {
      const {getPackageJsonDependencies} = await import("./monorepo-utils.js");

      const packageJson = {
        name: "test-package",
        dependencies: {
          "@ns-dojo/shared-core": "0.1.0",
          "@ns-dojo/shared-logging": "0.1.0",
          "some-external-package": "1.0.0",
        },
      };

      const packageJsonPath = join(tempDir, "package.json");
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      const result = await getPackageJsonDependencies(packageJsonPath);

      expect(result).toHaveLength(2);
      expect(result).toContain("shared-core");
      expect(result).toContain("shared-logging");
      expect(result).not.toContain("some-external-package");
    });

    it("should parse package.json devDependencies", async () => {
      const {getPackageJsonDevDependencies} = await import(
        "./monorepo-utils.js"
      );

      const packageJson = {
        name: "test-package",
        devDependencies: {
          "@ns-dojo/eslint-config-base": "0.1.0",
          "@ns-dojo/prettier-config": "0.1.0",
          eslint: "9.0.0",
        },
      };

      const packageJsonPath = join(tempDir, "package.json");
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      const result = await getPackageJsonDevDependencies(packageJsonPath);

      expect(result).toHaveLength(2);
      expect(result).toContain("eslint-config-base");
      expect(result).toContain("prettier-config");
      expect(result).not.toContain("eslint");
    });

    it("should return empty array for non-existent file", async () => {
      const {getPackageJsonDependencies} = await import("./monorepo-utils.js");

      const result = await getPackageJsonDependencies(
        "/nonexistent/package.json",
      );

      expect(result).toEqual([]);
    });
  });
});
