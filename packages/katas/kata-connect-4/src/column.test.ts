import {describe, expect, test} from "vitest";
import type {Column} from "./types.js";

describe("ColumnTypeShould", () => {
  test("be assignable to number", () => {
    const col = 1 as Column;
    const num: number = col;
    expect(num).toBe(1);
  });
});
