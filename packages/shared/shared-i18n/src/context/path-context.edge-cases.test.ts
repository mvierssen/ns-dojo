import {describe, expect, it} from "vitest";
import {createPathContext, getLocalizedPath} from "./path-context.js";

describe("Path context edge cases", () => {
  const pathContext = createPathContext("en");

  it("should handle complex path scenarios", () => {
    expect(getLocalizedPath(pathContext, "nl", "/en/deep/nested/path")).toBe(
      "/nl/deep/nested/path",
    );
    expect(getLocalizedPath(pathContext, "en", "/nl/deep/nested/path")).toBe(
      "/deep/nested/path",
    );
    expect(getLocalizedPath(pathContext, "fr", "/")).toBe("/fr");
    expect(getLocalizedPath(pathContext, "en", "/")).toBe("/");
    expect(getLocalizedPath(pathContext, "en", "/en")).toBe("/");
    expect(getLocalizedPath(pathContext, "nl", "/en")).toBe("/nl");
  });

  it("should handle paths with query strings and fragments", () => {
    expect(
      getLocalizedPath(pathContext, "nl", "/page?query=value#section"),
    ).toBe("/nl/page?query=value#section");
    expect(
      getLocalizedPath(pathContext, "en", "/nl/page?query=value#section"),
    ).toBe("/page?query=value#section");
    expect(getLocalizedPath(pathContext, "fr", "/?test=1")).toBe("/fr/?test=1");
  });

  it("should handle malformed paths", () => {
    expect(getLocalizedPath(pathContext, "nl", "")).toBe("/nl");
    expect(getLocalizedPath(pathContext, "en", "")).toBe("");
    expect(getLocalizedPath(pathContext, "nl", "no-leading-slash")).toBe(
      "/nlno-leading-slash", // No slash separator when path doesn't start with /
    );
    expect(getLocalizedPath(pathContext, "en", "no-leading-slash")).toBe(
      "no-leading-slash", // Default language removes prefix but keeps original path
    );
    expect(getLocalizedPath(pathContext, "nl", "///multiple///slashes")).toBe(
      "/nl///multiple///slashes", // Preserves existing slashes exactly
    );
  });

  it("should handle special path characters", () => {
    expect(getLocalizedPath(pathContext, "nl", "/path with spaces")).toBe(
      "/nl/path with spaces",
    );
    expect(getLocalizedPath(pathContext, "nl", "/path-with-dashes")).toBe(
      "/nl/path-with-dashes",
    );
    expect(getLocalizedPath(pathContext, "nl", "/path_with_underscores")).toBe(
      "/nl/path_with_underscores",
    );
    expect(getLocalizedPath(pathContext, "nl", "/path.with.dots")).toBe(
      "/nl/path.with.dots",
    );
  });

  it("should preserve existing language prefixes correctly", () => {
    expect(getLocalizedPath(pathContext, "nl", "/fr/page")).toBe("/nl/page");
    expect(getLocalizedPath(pathContext, "en", "/fr/page")).toBe("/page");
    expect(getLocalizedPath(pathContext, "de", "/nl/deep/path")).toBe(
      "/de/deep/path",
    );
  });
});
