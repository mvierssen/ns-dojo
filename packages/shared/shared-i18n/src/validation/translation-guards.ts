import type {PluralTranslation, TranslationFunction} from "../types.js";

export function isPluralTranslation(
  value: unknown,
): value is PluralTranslation {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("zero" in value || "one" in value || "two" in value || "other" in value)
  );
}

export function isTranslationFunction(
  value: unknown,
): value is TranslationFunction {
  return typeof value === "function";
}
