import {describe, expect, test} from "vitest";
import {resultIsSuccess, resultIsFailure} from "@ns-dojo/shared-core";
import type {Column} from "./types.js";
import {validateColumn} from "./column.js";

describe("ColumnTypeShould", () => {
  test("be assignable to number", () => {
    const col = 1 as Column;
    const num: number = col;
    expect(num).toBe(1);
  });

  test("validateColumn returns success for valid column 1", () => {
    const result = validateColumn(1);
    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value).toBe(1);
  });

  test("validateColumn returns success for valid column 7", () => {
    const result = validateColumn(7);
    expect(resultIsSuccess(result)).toBe(true);
  });

  test("validateColumn returns failure for 0", () => {
    const result = validateColumn(0);
    expect(resultIsFailure(result)).toBe(true);
  });

  test("validateColumn returns failure for 8", () => {
    const result = validateColumn(8);
    expect(resultIsFailure(result)).toBe(true);
  });
});
