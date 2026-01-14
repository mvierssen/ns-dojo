import {describe, expect, test} from "vitest";
import {COLUMN_LABELS_STRING} from "./constants.js";

describe("ConstantsShould", () => {
  test("define column labels string with correct spacing", () => {
    expect(COLUMN_LABELS_STRING).toBe("    1  2  3  4  5  6  7");
  });
});
