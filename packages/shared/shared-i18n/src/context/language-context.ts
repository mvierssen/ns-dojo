import {LanguageContextSchema} from "../schemas.js";
import type {LanguageContext} from "../types.js";

export function createLanguageContext(
  defaultLang: string,
  supportedLanguages: string[],
): LanguageContext {
  const value = {
    defaultLang,
    supportedLanguages,
  } satisfies LanguageContext;
  LanguageContextSchema.parse(value);
  return value;
}

export function getLanguageFromUrl(
  context: LanguageContext,
  url: string | URL,
): string {
  const urlObj =
    typeof url === "string" ? new URL(url, "http://example.com") : url;
  const [, langSegment] = urlObj.pathname.split("/");
  return langSegment && context.supportedLanguages.includes(langSegment)
    ? langSegment
    : context.defaultLang;
}

export function getLanguageFromBrowser(context: LanguageContext): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (globalThis.window == undefined) return context.defaultLang;
  return getLanguageFromUrl(context, globalThis.location.pathname);
}

export function getLanguageFromHeader(
  context: LanguageContext,
  acceptLanguage?: string,
): string {
  if (!acceptLanguage) return context.defaultLang;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0]?.trim().toLowerCase() ?? "");

  return (
    languages.find((lang) => context.supportedLanguages.includes(lang)) ??
    context.defaultLang
  );
}

export function getBestLanguage(
  context: LanguageContext,
  options: {
    url?: string | URL;
    acceptLanguage?: string;
    fallback?: string;
  } = {},
): string {
  const {url, acceptLanguage, fallback = context.defaultLang} = options;

  if (url) {
    const urlLang = getLanguageFromUrl(context, url);
    if (urlLang !== context.defaultLang) return urlLang;
  }

  if (acceptLanguage) {
    const headerLang = getLanguageFromHeader(context, acceptLanguage);
    if (headerLang !== context.defaultLang) return headerLang;
  }

  return fallback;
}
