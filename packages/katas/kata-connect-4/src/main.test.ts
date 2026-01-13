import {describe, expect, test} from "vitest";
import * as main from "./main.js";

describe("MainEntrypointShould", () => {
  test("export createCli function", () => {
    expect(main.createCli).toBeDefined();
    expect(typeof main.createCli).toBe("function");
  });

  test("import required modules", async () => {
    // Verify imports by checking the module can be loaded
    const module = await import("./main.js");
    expect(module).toBeDefined();
  });
});
