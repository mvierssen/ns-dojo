import { describe, expect, test } from "vitest";

import { getGameInstructions } from "./instructions.js";

describe("InstructionsShould", () => {
  test("include a welcome message", () => {
    const instructions = getGameInstructions();
    expect(instructions.welcome).toBeDefined();
    expect(instructions.welcome.length).toBeGreaterThan(0);
  });
});
