import {z} from "zod";

export const TranslationParamsSchema = z
  .object({
    count: z.number().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.undefined()]));

/**
 * Zod schema for translation function
 * Note: Functions are complex in Zod, using z.any() for validation
 */
export const TranslationFunctionSchema = z.custom<
  (params: Record<string, string | number>) => string
>((val) => typeof val === "function", {
  message: "Expected translation function",
});

export const AnyTranslationFunctionSchema = z.custom<
  (params: Record<string, string | number | boolean | undefined>) => string
>((val) => typeof val === "function", {message: "Expected function"});

export const PluralTranslationSchema = z.object({
  zero: z.union([z.string(), TranslationFunctionSchema]).optional(),
  one: z.union([z.string(), TranslationFunctionSchema]).optional(),
  two: z.union([z.string(), TranslationFunctionSchema]).optional(),
  other: z.union([z.string(), TranslationFunctionSchema]).optional(),
});

export const AnyPluralTranslationSchema = z.object({
  zero: z.union([z.string(), AnyTranslationFunctionSchema]).optional(),
  one: z.union([z.string(), AnyTranslationFunctionSchema]).optional(),
  two: z.union([z.string(), AnyTranslationFunctionSchema]).optional(),
  other: z.union([z.string(), AnyTranslationFunctionSchema]).optional(),
});

export const TranslationValueSchema = z.union([
  z.string(),
  TranslationFunctionSchema,
  PluralTranslationSchema,
]);

export const AnyTranslationValueSchema = z.union([
  z.string(),
  AnyTranslationFunctionSchema,
  AnyPluralTranslationSchema,
]);

export const TranslatorFunctionSchema = z.custom<
  (key: string, params?: Record<string, string | number | undefined>) => string
>((val) => typeof val === "function", {message: "Expected translator"});

export const LanguageConfigSchema = z.record(z.string(), z.string());

export const LanguageContextSchema = z.object({
  defaultLang: z.string(),
  supportedLanguages: z.array(z.string()),
});

export const PathContextSchema = z.object({
  defaultLang: z.string(),
});

export const I18nDictionariesSchema = z.record(
  z.string(),
  z.record(z.string(), AnyTranslationValueSchema),
);

export const I18nContextSchema = z.object({
  dictionaries: I18nDictionariesSchema,
  defaultLang: z.string(),
  supportedLanguages: z.array(z.string()),
});

export const TranslatorConfigSchema = z.object({
  missingKeyHandler: z
    .function({
      input: [z.string(), z.string()],
      output: z.string(),
    })
    .optional(),
});
