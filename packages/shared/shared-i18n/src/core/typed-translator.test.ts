import {describe, expect, it} from "vitest";
import {createI18nContext} from "../context/i18n-context.js";
import {createTranslator} from "./basic-translator.js";
import {createTypedTranslator, getTypedTranslator} from "./typed-translator.js";

const missingKeyHandler = (key: string) => `MISSING: ${key}`;

describe("Typed Translation Functions", () => {
  const testDictionary = {
    simple: "Hello World",
    withFunction: (params: Record<string, string | number>) =>
      `Hello ${String(params.name)}`,
    plural: {
      zero: "No items",
      one: "One item",
      other: (params: Record<string, string | number>) =>
        `${String(params.count)} items`,
    },
  };

  describe("createTypedTranslator", () => {
    it("should handle simple string translations", () => {
      const t = createTypedTranslator(testDictionary);
      expect(t("simple")).toBe("Hello World");
    });

    it("should return translator function", () => {
      const t = createTypedTranslator(testDictionary);
      expect(typeof t).toBe("function");
    });

    it("should support custom missing key handler", () => {
      const t = createTypedTranslator(testDictionary, {
        missingKeyHandler,
      });
      const result = (t as (key: string) => string)("nonexistent");
      expect(result).toBe("MISSING: nonexistent");
    });
  });

  describe("getTypedTranslator with I18nContext", () => {
    const dictionaries = {
      en: {
        greeting: "Hello",
        simple: "Simple text",
      },
      nl: {
        greeting: "Hallo",
        simple: "Eenvoudige tekst",
      },
    };
    const languages = {en: "English", nl: "Nederlands"};
    const i18nContext = createI18nContext(dictionaries, "en", languages);

    it("should provide translators for different languages", () => {
      const enT = getTypedTranslator(i18nContext, "en");
      const nlT = getTypedTranslator(i18nContext, "nl");

      expect(enT("simple")).toBe("Simple text");
      expect(nlT("simple")).toBe("Eenvoudige tekst");
      expect(enT("greeting")).toBe("Hello");
      expect(nlT("greeting")).toBe("Hallo");
    });

    it("should fallback to default language for missing language", () => {
      const frT = getTypedTranslator(i18nContext, "fr");
      expect(frT("simple")).toBe("Simple text");
    });

    it("should throw error for completely missing dictionaries", () => {
      const emptyContext = createI18nContext({}, "en", {});

      let thrownError;
      try {
        getTypedTranslator(emptyContext, "en");
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).message).toBe(
        "No dictionary found for language: en",
      );
    });
  });

  describe("Integration with regular translator", () => {
    const dictionary = {
      simple: "Hello World",
      withParams: (params: Record<string, string | number>) =>
        `Hello ${String(params.name)}`,
    };

    it("should produce same results as regular translator for simple strings", () => {
      const typedT = createTypedTranslator(dictionary);
      const regularT = createTranslator(dictionary);

      expect(typedT("simple")).toBe(regularT("simple"));
    });

    it("should handle function translations consistently", () => {
      const typedT = createTypedTranslator(dictionary);
      const regularT = createTranslator(dictionary);

      const params = {name: "John"};
      const regularResult = regularT("withParams", params);
      const typedResult = (
        typedT as (k: string, p?: Record<string, string | number>) => string
      )("withParams", params);

      expect(typedResult).toBe(regularResult);
      expect(typedResult).toBe("Hello John");
    });
  });
});
