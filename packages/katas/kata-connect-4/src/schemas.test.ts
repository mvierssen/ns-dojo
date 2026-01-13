import {describe, expect, test} from "vitest";
import {ColumnInputSchema} from "./schemas.js";

describe("ColumnInputSchemaShould", () => {
  test("accept valid column 1", () => {
    const result = ColumnInputSchema.safeParse(1);
    expect(result.success).toBe(true);
  });
});
