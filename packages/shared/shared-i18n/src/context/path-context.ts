import {PathContextSchema} from "../schemas.js";
import type {PathContext} from "../types.js";

export function createPathContext(defaultLang: string): PathContext {
  const value = {defaultLang} satisfies PathContext;
  PathContextSchema.parse(value);
  return value;
}

export function getLocalizedPath(
  context: PathContext,
  targetLang: string,
  currentPath: string,
): string {
  const langPrefixRegex = /^\/[a-z]{2}(?=\/|$)/;
  const hasLangPrefix = langPrefixRegex.test(currentPath);

  if (targetLang === context.defaultLang) {
    return hasLangPrefix
      ? currentPath.replace(langPrefixRegex, "") || "/"
      : currentPath;
  } else {
    if (hasLangPrefix) {
      return currentPath.replace(langPrefixRegex, `/${targetLang}`);
    }
    return `/${targetLang}${currentPath === "/" ? "" : currentPath}`;
  }
}

export function createPathTranslator(
  context: PathContext,
  lang: string,
): (path: string, targetLang?: string) => string {
  return (path, targetLang = lang) =>
    getLocalizedPath(context, targetLang, path);
}
