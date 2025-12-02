import {createModuleLogger} from "@ns-dojo/shared-logging";
import type {I18nContext} from "../context/i18n-context.js";
import type {
  PluralTranslation,
  TranslationFunction,
  TranslationParams,
  TranslatorConfig,
} from "../types.js";
import {resolveTranslationValue} from "./translation-resolver.js";

const logger = createModuleLogger("i18n");

export function createTypedTranslator<T extends Record<string, unknown>>(
  dictionary: T,
  config: TranslatorConfig = {},
) {
  const {missingKeyHandler = (key: string) => key} = config;

  type TranslateFunction = <K extends keyof T>(
    key: K,
    ...args: T[K] extends TranslationFunction<infer P>
      ? [P]
      : T[K] extends PluralTranslation<infer P>
        ? [P & {count: number}]
        : T[K] extends string
          ? []
          : [TranslationParams?]
  ) => string;

  function translate(key: keyof T, params?: TranslationParams): string {
    const value = dictionary[key];

    if (value == null) {
      return missingKeyHandler(key as string, "current");
    }

    try {
      return resolveTranslationValue(value, params ?? {});
    } catch (error) {
      logger.warn("Translation failed", {
        key: key as string,
        error: error instanceof Error ? error.message : String(error),
      });
      return missingKeyHandler(key as string, "current");
    }
  }

  return translate as TranslateFunction;
}

export function getTypedTranslator<
  T extends Record<string, Record<string, unknown>>,
  TLang extends keyof T,
>(
  context: I18nContext<T>,
  lang: TLang,
): ReturnType<typeof createTypedTranslator<T[TLang]>>;
export function getTypedTranslator<
  T extends Record<string, Record<string, unknown>>,
>(
  context: I18nContext<T>,
  lang: string,
): ReturnType<typeof createTypedTranslator<Record<string, unknown>>>;

export function getTypedTranslator<
  T extends Record<string, Record<string, unknown>>,
>(context: I18nContext<T>, lang: string) {
  const dictionary =
    context.dictionaries[lang] ?? context.dictionaries[context.defaultLang];
  if (!dictionary) throw new Error(`No dictionary found for language: ${lang}`);
  return createTypedTranslator(dictionary, {
    missingKeyHandler: (key, l) => {
      logger.warn("Missing translation key", {
        key,
        language: l,
      });
      return key;
    },
  });
}
