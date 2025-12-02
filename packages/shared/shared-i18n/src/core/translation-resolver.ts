import type {AnyTranslationValue} from "../types.js";

export function resolveTranslationValue(
  value: AnyTranslationValue,
  params: Record<string, string | number | undefined>,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "function") {
    return value(params as Record<string, string | number>);
  }

  if (typeof value === "object") {
    const pluralValue = value;
    const count = params.count;

    if (typeof count === "number") {
      if (count === 0 && pluralValue.zero) {
        return resolveTranslationValue(pluralValue.zero, params);
      }
      if (count === 1 && pluralValue.one) {
        return resolveTranslationValue(pluralValue.one, params);
      }
      if (count === 2 && pluralValue.two) {
        return resolveTranslationValue(pluralValue.two, params);
      }
      if (pluralValue.other) {
        return resolveTranslationValue(pluralValue.other, params);
      }
    } else {
      if (pluralValue.other) {
        return resolveTranslationValue(pluralValue.other, params);
      }
      if (pluralValue.one) {
        return resolveTranslationValue(pluralValue.one, params);
      }
    }
  }

  return "Missing translation";
}
