import {describe, expect, it} from "vitest";
import {createI18nContext} from "../context/i18n-context.js";
import {createTranslator, getTranslator} from "./basic-translator.js";

describe("Basic Translator Functions", () => {
  const mockDict = {
    simple: "Hello World",
    withParams: (params: Record<string, string | number>) =>
      `Hello ${params.name as string}`,
    plural: {
      zero: "No items",
      one: "One item",
      two: "Two items",
      other: (params: Record<string, string | number>) =>
        `${String(params.count)} items`,
    },
  };

  describe("createTranslator", () => {
    it("should handle simple string translations", () => {
      const t = createTranslator(mockDict);
      expect(t("simple")).toBe("Hello World");
    });

    it("should handle template function translations", () => {
      const t = createTranslator(mockDict);
      expect(t("withParams", {name: "John"})).toBe("Hello John");
    });

    it("should handle plural translations", () => {
      const t = createTranslator(mockDict);
      expect(t("plural", {count: 0})).toBe("No items");
      expect(t("plural", {count: 1})).toBe("One item");
      expect(t("plural", {count: 2})).toBe("Two items");
      expect(t("plural", {count: 5})).toBe("5 items");
    });

    it("should return key for missing translations", () => {
      const t = createTranslator(mockDict);
      expect(t("missing.key")).toBe("missing.key");
    });
  });

  describe("I18n Manager Functions", () => {
    const dictionaries = {
      en: {greeting: "Hello"},
      nl: {greeting: "Hallo"},
    };
    const languages = {en: "English", nl: "Nederlands"};
    const i18nContext = createI18nContext(dictionaries, "en", languages);

    it("should provide translators for different languages", () => {
      const enT = getTranslator(i18nContext, "en");
      const nlT = getTranslator(i18nContext, "nl");

      expect(enT("greeting")).toBe("Hello");
      expect(nlT("greeting")).toBe("Hallo");
    });
  });
});
