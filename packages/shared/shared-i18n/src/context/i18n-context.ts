import {I18nDictionariesSchema, LanguageConfigSchema} from "../schemas.js";
import type {AnyTranslationValue, LanguageConfig} from "../types.js";

export type DictionaryLike = Record<string | number | symbol, unknown>;

export type ReadableDictionary = Record<string, AnyTranslationValue>;

export interface I18nContext<
  T extends Record<string, Record<string, unknown>>,
> {
  dictionaries: T;
  defaultLang: string;
  supportedLanguages: string[];
}

export function createI18nContext<
  T extends Record<string, Record<string, unknown>>,
>(
  dictionaries: T,
  defaultLang: string,
  languageConfig: LanguageConfig,
): I18nContext<T> {
  const parsedLangConfig = LanguageConfigSchema.parse(languageConfig);
  I18nDictionariesSchema.parse(
    dictionaries as Record<string, Record<string, unknown>>,
  );
  return {
    dictionaries,
    defaultLang,
    supportedLanguages: Object.keys(parsedLangConfig),
  };
}

export function getSupportedLanguages<
  T extends Record<string, Record<string, unknown>>,
>(context: I18nContext<T>): string[] {
  return [...context.supportedLanguages];
}

export function getDefaultLanguage<
  T extends Record<string, Record<string, unknown>>,
>(context: I18nContext<T>): string {
  return context.defaultLang;
}
