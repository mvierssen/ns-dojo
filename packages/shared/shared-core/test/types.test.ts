import { describe, expect, it } from "vitest";
import { createFailureResult, createSuccessResult } from "../src/types.js";

describe("result", () => {
  it("should create a success result with a value", () => {
    const value = { data: "test" };
    const result = createSuccessResult(value);
    expect(result).toEqual({ success: true, value });
  });

  it("should create a failure result with an error", () => {
    const error = "Error. Transaction rejected. balance too low";
    const result = createFailureResult(error);
    expect(result).toEqual({ success: false, error });
  });
});
