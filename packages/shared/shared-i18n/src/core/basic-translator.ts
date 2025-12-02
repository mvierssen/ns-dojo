import {createModuleLogger} from "@ns-dojo/shared-logging";
import type {I18nContext} from "../context/i18n-context.js";
import {TranslatorConfigSchema} from "../schemas.js";
import type {
  AnyTranslationValue,
  TranslationParams,
  TranslatorConfig,
  TranslatorFunction,
} from "../types.js";
import {resolveTranslationValue} from "./translation-resolver.js";

const logger = createModuleLogger("i18n");

export function createTranslator(
  dictionary: Record<string, unknown>,
  config: TranslatorConfig = {},
): TranslatorFunction {
  const parsed = TranslatorConfigSchema.safeParse(config);
  const missingKeyHandler = parsed.success
    ? (parsed.data.missingKeyHandler ?? ((key: string) => key))
    : (key: string) => key;

  return function translate(
    key: string,
    params: TranslationParams = {},
  ): string {
    const translationValue = dictionary[key];

    if (translationValue === undefined) {
      return missingKeyHandler(key, "current");
    }

    try {
      return resolveTranslationValue(
        translationValue as AnyTranslationValue,
        params,
      );
    } catch (error) {
      logger.warn("Translation failed", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return missingKeyHandler(key, "current");
    }
  };
}

export function getTranslator<
  T extends Record<string, Record<string, unknown>>,
>(context: I18nContext<T>, lang: string): TranslatorFunction {
  const dictionary =
    context.dictionaries[lang] ?? context.dictionaries[context.defaultLang];
  if (!dictionary) throw new Error(`No dictionary found for language: ${lang}`);

  return createTranslator(dictionary, {
    missingKeyHandler: (key, l) => {
      logger.warn("Missing translation key", {
        key,
        language: l,
      });
      return key;
    },
  });
}
