import {describe, expect, it} from "vitest";
import {
  isPluralTranslation,
  isTranslationFunction,
} from "./translation-guards.js";

const testFunc = (_params: Record<string, string | number>) => "test";

describe("Utility Functions and Type Detection", () => {
  describe("Translation type detection utilities", () => {
    it("should correctly identify translation functions", () => {
      expect(isTranslationFunction(testFunc)).toBe(true);
      expect(isTranslationFunction("string")).toBe(false);
      expect(isTranslationFunction({one: "test"})).toBe(false);
      expect(isTranslationFunction(123)).toBe(false);
      expect(isTranslationFunction(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(isTranslationFunction(undefined)).toBe(false);
    });

    it("should correctly identify plural translation objects", () => {
      expect(isPluralTranslation({one: "test", other: "tests"})).toBe(true);
      expect(isPluralTranslation({zero: "none", other: "many"})).toBe(true);
      expect(isPluralTranslation({two: "pair"})).toBe(true);
      expect(isPluralTranslation(testFunc)).toBe(false);
      expect(isPluralTranslation("string")).toBe(false);
      expect(isPluralTranslation({})).toBe(false);
      expect(isPluralTranslation({random: "prop"})).toBe(false);
      expect(isPluralTranslation([])).toBe(false);
      expect(isPluralTranslation(null)).toBe(false);
    });
  });
});
