import {describe, expect, test} from "vitest";
import {ColumnInputSchema} from "./schemas.js";

describe("ColumnInputSchemaShould", () => {
  test("accept valid column 1", () => {
    const result = ColumnInputSchema.safeParse(1);
    expect(result.success).toBe(true);
  });

  test("accept valid column 7", () => {
    const result = ColumnInputSchema.safeParse(7);
    expect(result.success).toBe(true);
  });

  test("reject column 0 (below range)", () => {
    const result = ColumnInputSchema.safeParse(0);
    expect(result.success).toBe(false);
  });

  test("reject column 8 (above range)", () => {
    const result = ColumnInputSchema.safeParse(8);
    expect(result.success).toBe(false);
  });

  test("reject non-integer values", () => {
    const result = ColumnInputSchema.safeParse(3.5);
    expect(result.success).toBe(false);
  });
});
