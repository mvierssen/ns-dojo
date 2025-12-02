import type {z} from "zod";
import type {
  I18nContextSchema,
  I18nDictionariesSchema,
  LanguageConfigSchema,
  LanguageContextSchema,
  PathContextSchema,
  TranslationParamsSchema,
  TranslatorConfigSchema,
} from "./schemas.js";

export type TranslationParams = z.infer<typeof TranslationParamsSchema>;

export type LanguageConfig = z.infer<typeof LanguageConfigSchema>;
export type LanguageContext = z.infer<typeof LanguageContextSchema>;
export type PathContext = z.infer<typeof PathContextSchema>;
export type I18nDictionaries = z.infer<typeof I18nDictionariesSchema>;
export type I18nContextData = z.infer<typeof I18nContextSchema>;
export type TranslatorConfig = z.infer<typeof TranslatorConfigSchema>;

export type TranslationFunction<TParams = Record<string, string | number>> = (
  params: TParams,
) => string;

export type AnyTranslationFunction = TranslationFunction<
  Record<string, string | number | boolean | undefined>
>;

export interface PluralTranslation<TParams = Record<string, string | number>> {
  zero?: string | TranslationFunction<TParams>;
  one?: string | TranslationFunction<TParams>;
  two?: string | TranslationFunction<TParams>;
  other?: string | TranslationFunction<TParams>;
}

export type AnyPluralTranslation = PluralTranslation<
  Record<string, string | number | boolean | undefined>
>;

export type TranslationValue<TParams = Record<string, string | number>> =
  | string
  | TranslationFunction<TParams>
  | PluralTranslation<TParams>;

export type AnyTranslationValue =
  | string
  | AnyTranslationFunction
  | AnyPluralTranslation;

export type TranslatorFunction = (
  key: string,
  params?: TranslationParams,
) => string;
