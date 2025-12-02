import {describe, expect, it, vi} from "vitest";
import {getTranslator} from "../core/basic-translator.js";
import {createI18nContext} from "./i18n-context.js";

describe("I18n context edge cases", () => {
  it("should handle empty dictionaries", () => {
    const emptyContext = createI18nContext({}, "en", {});

    expect(() => getTranslator(emptyContext, "en")).toThrow(
      "No dictionary found for language: en",
    );
    expect(() => getTranslator(emptyContext, "any")).toThrow(
      "No dictionary found for language: any",
    );
  });

  it("should handle context with missing language fallback", () => {
    const partialDictionaries = {
      en: {greeting: "Hello"},
      // nl dictionary is missing
    };
    const context = createI18nContext(partialDictionaries, "en", {
      en: "English",
      nl: "Dutch",
    });

    const nlTranslator = getTranslator(context, "nl");
    expect(nlTranslator("greeting")).toBe("Hello");

    const frTranslator = getTranslator(context, "fr");
    expect(frTranslator("greeting")).toBe("Hello");
  });

  it("should handle context with no default language", () => {
    const dictionaries = {
      fr: {greeting: "Bonjour"},
      de: {greeting: "Hallo"},
    };
    const context = createI18nContext(dictionaries, "en", {
      fr: "French",
      de: "German",
    });

    expect(() => getTranslator(context, "en")).toThrow(
      "No dictionary found for language: en",
    );
  });

  it("should warn about missing translation keys", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // Mock console.warn to suppress warnings during test
    });
    const dictionaries = {en: {greeting: "Hello"}};
    const context = createI18nContext(dictionaries, "en", {en: "English"});

    const t = getTranslator(context, "en");
    expect(t("missing")).toBe("missing");
    expect(consoleSpy).toHaveBeenCalledWith(
      "[WARN] i18n: Missing translation key",
      {
        key: "missing",
        language: "current",
      },
    );

    consoleSpy.mockRestore();
  });

  it("should handle complex nested dictionary structures", () => {
    const nestedDictionaries = {
      en: {
        nested: {
          deep: {
            value: "Deep value",
          },
        },
        simple: "Simple value",
        func: (params: Record<string, string | number>) =>
          `Func with ${String(params.param)}`,
      },
    };

    const context = createI18nContext(nestedDictionaries, "en", {
      en: "English",
    });
    const t = getTranslator(context, "en");

    expect(t("simple")).toBe("Simple value");
    expect(t("func", {param: "test"})).toBe("Func with test");
    expect(t("nested")).toBe("Missing translation");
  });
});
