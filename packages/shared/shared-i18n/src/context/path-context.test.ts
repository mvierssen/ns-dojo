import {describe, expect, it} from "vitest";
import {createPathContext, getLocalizedPath} from "./path-context.js";

describe("Path Localization", () => {
  describe("Path Localization Functions", () => {
    const pathContext = createPathContext("en");

    it("should localize paths correctly", () => {
      expect(getLocalizedPath(pathContext, "nl", "/page")).toBe("/nl/page");
      expect(getLocalizedPath(pathContext, "en", "/nl/page")).toBe("/page");
      expect(getLocalizedPath(pathContext, "nl", "/")).toBe("/nl");
    });
  });
});
