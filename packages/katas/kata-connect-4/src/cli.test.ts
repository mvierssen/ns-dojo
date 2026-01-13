import {describe, expect, test} from "vitest";
import {formatWelcome} from "./cli.js";

describe("CliOutputShould", () => {
  test("format welcome message with game title", () => {
    const welcome = formatWelcome();
    expect(welcome).toContain("Connect 4");
  });
});
