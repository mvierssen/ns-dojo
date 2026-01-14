import {describe, expect, test} from "vitest";
import {resultIsSuccess, resultIsFailure} from "@ns-dojo/shared-core";
import {parseColumnInput} from "./input.js";
import type {Column} from "./types.js";

describe("InputParsingShould", () => {
  test("return success for valid column '4'", () => {
    const result = parseColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value).toBe(4);
  });

  test("return failure for '0'", () => {
    const result = parseColumnInput("0");
    expect(resultIsFailure(result)).toBe(true);
  });

  test("return failure for non-numeric 'abc'", () => {
    const result = parseColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
  });

  test("return Column branded type for valid input", () => {
    const result = parseColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    if (!resultIsSuccess(result)) return;
    // Type assertion to verify it's a Column
    const col: Column = result.value;
    expect(col).toBe(4);
  });
});
