import {describe, expect, test} from "vitest";
import {resultIsSuccess, resultIsFailure} from "@ns-dojo/shared-core";
import {parseColumnInput} from "./input.js";

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
});
