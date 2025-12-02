import {describe, expect, it, vi} from "vitest";
import {createTranslator} from "../index.js";

const customMissingKeyHandler = (key: string, lang: string) =>
  `CUSTOM_MISSING[${lang}]: ${key}`;

const throwingMissingKeyHandler = () => {
  throw new Error("Handler error");
};

describe("Translation error handling", () => {
  const errorDictionary = {
    simple: "Hello",
    broken: () => {
      throw new Error("Translation function error");
    },
    plural: {
      one: () => {
        throw new Error("Plural function error");
      },
      other: "Many items",
    },
    nestedError: {
      zero: () => {
        throw new Error("Nested error");
      },
      other: () => {
        throw new Error("Another nested error");
      },
    },
  };

  it("should handle translator function errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // Mock console.warn to suppress warnings during test
    });
    const t = createTranslator(errorDictionary);

    expect(t("broken")).toBe("broken");
    expect(consoleSpy).toHaveBeenCalledWith("[WARN] i18n: Translation failed", {
      key: "broken",
      error: "Translation function error",
    });

    consoleSpy.mockRestore();
  });

  it("should handle plural translation function errors", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // Mock console.warn to suppress warnings during test
    });
    const t = createTranslator(errorDictionary);

    expect(t("plural", {count: 1})).toBe("plural");
    expect(t("plural", {count: 2})).toBe("Many items");
    expect(consoleSpy).toHaveBeenCalledWith("[WARN] i18n: Translation failed", {
      key: "plural",
      error: "Plural function error",
    });

    consoleSpy.mockRestore();
  });

  it("should handle nested plural errors", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // Mock console.warn to suppress warnings during test
    });
    const t = createTranslator(errorDictionary);

    expect(t("nestedError", {count: 0})).toBe("nestedError");
    expect(t("nestedError", {count: 5})).toBe("nestedError");
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });

  it("should handle custom missing key handlers", () => {
    const t = createTranslator(errorDictionary, {
      missingKeyHandler: customMissingKeyHandler,
    });

    expect(t("nonexistent")).toBe("CUSTOM_MISSING[current]: nonexistent");
  });

  it("should handle missing key handler that throws", () => {
    const t = createTranslator(errorDictionary, {
      missingKeyHandler: throwingMissingKeyHandler,
    });

    expect(() => t("nonexistent")).toThrow("Handler error");
  });
});
