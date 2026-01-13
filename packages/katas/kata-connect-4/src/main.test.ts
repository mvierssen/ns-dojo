import {describe, expect, test} from "vitest";
import {createCli} from "./main.js";

describe("MainEntrypointShould", () => {
  test("export createCli function", () => {
    expect(createCli).toBeDefined();
    expect(typeof createCli).toBe("function");
  });
});
