import {describe, expect, it} from "vitest";
import {
  createLanguageContext,
  getBestLanguage,
  getLanguageFromHeader,
  getLanguageFromUrl,
} from "./language-context.js";

describe("Language detection edge cases", () => {
  const langContext = createLanguageContext("en", ["en", "nl", "fr"]);

  it("should handle malformed URLs in getLanguageFromUrl", () => {
    expect(getLanguageFromUrl(langContext, "/")).toBe("en");
    expect(getLanguageFromUrl(langContext, "/root")).toBe("en");
    expect(getLanguageFromUrl(langContext, "/invalid-lang/page")).toBe("en");
    expect(getLanguageFromUrl(langContext, "/123/page")).toBe("en");
    expect(getLanguageFromUrl(langContext, "/en/test")).toBe("en");
  });

  it("should handle complex Accept-Language headers", () => {
    expect(getLanguageFromHeader(langContext, "fr-FR,fr;q=0.9,en;q=0.8")).toBe(
      "fr",
    );
    expect(getLanguageFromHeader(langContext, "de,fr;q=0.9,en;q=0.8")).toBe(
      "fr",
    );
    expect(getLanguageFromHeader(langContext, "de-DE,de;q=0.9")).toBe("en");
    expect(getLanguageFromHeader(langContext, "")).toBe("en");
    expect(getLanguageFromHeader(langContext, "invalid")).toBe("en");
    expect(getLanguageFromHeader(langContext, ";;q=")).toBe("en");
    expect(getLanguageFromHeader(langContext, "en-US;q=1.0,nl;q=0.9")).toBe(
      "nl",
    );
  });

  it("should handle getBestLanguage with various combinations", () => {
    expect(
      getBestLanguage(langContext, {
        url: "/fr/page",
        acceptLanguage: "nl,en;q=0.9",
      }),
    ).toBe("fr");

    expect(
      getBestLanguage(langContext, {
        url: "/invalid/page",
        acceptLanguage: "nl,en;q=0.9",
      }),
    ).toBe("nl");

    expect(
      getBestLanguage(langContext, {
        acceptLanguage: "de,zh;q=0.9",
        fallback: "fr",
      }),
    ).toBe("fr");

    expect(getBestLanguage(langContext, {})).toBe("en");

    expect(
      getBestLanguage(langContext, {
        url: "/en/page",
        acceptLanguage: "nl,fr;q=0.9",
        fallback: "nl",
      }),
    ).toBe("nl");
  });

  it("should handle URL object in getLanguageFromUrl", () => {
    const url = new URL("/nl/page", "https://example.com");
    expect(getLanguageFromUrl(langContext, url)).toBe("nl");

    const rootUrl = new URL("/", "https://example.com");
    expect(getLanguageFromUrl(langContext, rootUrl)).toBe("en");
  });

  it("should handle edge cases in language context creation", () => {
    const emptyLangContext = createLanguageContext("en", []);
    expect(getLanguageFromUrl(emptyLangContext, "/nl/page")).toBe("en");
    expect(getLanguageFromHeader(emptyLangContext, "nl")).toBe("en");

    const singleLangContext = createLanguageContext("fr", ["fr"]);
    expect(getLanguageFromUrl(singleLangContext, "/en/page")).toBe("fr");
    expect(getLanguageFromHeader(singleLangContext, "en,nl")).toBe("fr");
  });
});
