import {describe, expect, it} from "vitest";
import {
  createI18nContext,
  getDefaultLanguage,
  getSupportedLanguages,
} from "./i18n-context.js";
import {
  createLanguageContext,
  getLanguageFromHeader,
  getLanguageFromUrl,
} from "./language-context.js";

describe("Language Detection and Context", () => {
  describe("Language Detection Functions", () => {
    const langContext = createLanguageContext("en", ["en", "nl"]);

    it("should detect language from URL", () => {
      expect(getLanguageFromUrl(langContext, "/nl/page")).toBe("nl");
      expect(getLanguageFromUrl(langContext, "/en/page")).toBe("en");
      expect(getLanguageFromUrl(langContext, "/page")).toBe("en");
    });

    it("should detect language from Accept-Language header", () => {
      expect(getLanguageFromHeader(langContext, "nl,en;q=0.9")).toBe("nl");
      expect(getLanguageFromHeader(langContext, "fr,en;q=0.9")).toBe("en");
    });
  });

  describe("Language Context Functions", () => {
    const dictionaries = {
      en: {greeting: "Hello"},
      nl: {greeting: "Hallo"},
    };
    const languages = {en: "English", nl: "Nederlands"};
    const i18nContext = createI18nContext(dictionaries, "en", languages);

    it("should provide language utilities", () => {
      expect(getSupportedLanguages(i18nContext)).toEqual(["en", "nl"]);
      expect(getDefaultLanguage(i18nContext)).toBe("en");
    });
  });
});
