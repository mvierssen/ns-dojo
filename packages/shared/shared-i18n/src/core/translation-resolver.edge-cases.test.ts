import {describe, expect, it} from "vitest";
import {createTranslator} from "./basic-translator.js";

describe("Complex plural translations", () => {
  const complexPluralDict = {
    items: {
      zero: "No items at all",
      one: (params: Record<string, string | number>) =>
        `Exactly one ${String(params.type)} item`,
      two: "A pair of items",
      other: (params: Record<string, string | number>) =>
        `${String(params.count)} ${String(params.type)} items`,
    },
    incomplete: {
      two: "Only two case",
    },
    onlyOther: {
      other: "Default case only",
    },
    onlyOne: {
      one: "Single case",
    },
    mixedTypes: {
      zero: (params: Record<string, string | number>) =>
        `Zero with ${String(params.extra)}`,
      one: "One string",
      two: (params: Record<string, string | number>) =>
        `Two with ${String(params.extra)}`,
      other: "Many string",
    },
  };

  it("should handle complex plural scenarios", () => {
    const t = createTranslator(complexPluralDict);

    expect(t("items", {count: 0, type: "book"})).toBe("No items at all");
    expect(t("items", {count: 1, type: "book"})).toBe("Exactly one book item");
    expect(t("items", {count: 2, type: "book"})).toBe("A pair of items");
    expect(t("items", {count: 5, type: "book"})).toBe("5 book items");
    expect(t("items", {count: 100, type: "book"})).toBe("100 book items");
  });

  it("should handle incomplete plural objects", () => {
    const t = createTranslator(complexPluralDict);

    expect(t("incomplete", {count: 2})).toBe("Only two case");
    expect(t("incomplete", {count: 1})).toBe("Missing translation");
    expect(t("incomplete", {count: 0})).toBe("Missing translation");

    expect(t("onlyOther", {count: 0})).toBe("Default case only");
    expect(t("onlyOther", {count: 1})).toBe("Default case only");
    expect(t("onlyOther", {count: 2})).toBe("Default case only");

    expect(t("onlyOne", {count: 1})).toBe("Single case");
    expect(t("onlyOne", {count: 0})).toBe("Missing translation");
    expect(t("onlyOne", {count: 2})).toBe("Missing translation");
  });

  it("should handle plurals without count parameter", () => {
    const t = createTranslator(complexPluralDict);

    expect(t("items")).toBe("undefined undefined items");
    expect(t("onlyOther")).toBe("Default case only");
    expect(t("incomplete")).toBe("Missing translation");
    expect(t("onlyOne")).toBe("Single case");
  });

  it("should handle invalid count values", () => {
    const t = createTranslator(complexPluralDict);

    expect(t("items", {count: -1, type: "book"})).toBe("-1 book items");
    expect(t("items", {count: 1.5, type: "book"})).toBe("1.5 book items");
    expect(t("items", {count: Infinity, type: "book"})).toBe(
      "Infinity book items",
    );
    expect(t("onlyOther", {count: Number.NaN})).toBe("Default case only");
    expect(t("onlyOther", {count: "invalid" as unknown as number})).toBe(
      "Default case only",
    );
  });

  it("should handle mixed function and string types in plurals", () => {
    const t = createTranslator(complexPluralDict);

    expect(t("mixedTypes", {count: 0, extra: "param"})).toBe("Zero with param");
    expect(t("mixedTypes", {count: 1, extra: "ignored"})).toBe("One string");
    expect(t("mixedTypes", {count: 2, extra: "param"})).toBe("Two with param");
    expect(t("mixedTypes", {count: 5, extra: "ignored"})).toBe("Many string");
  });
});
