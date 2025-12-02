import { describe, expect, test } from "vitest";

import { getGameInstructions } from "./instructions.js";

describe("InstructionsShould", () => {
  test("include a welcome message", () => {
    const instructions = getGameInstructions();
    expect(instructions.welcome).toBeDefined();
    expect(instructions.welcome.length).toBeGreaterThan(0);
  });

  test("explain board is 6 rows by 7 columns", () => {
    const instructions = getGameInstructions();
    expect(instructions.rules.boardDimensions).toContain("6");
    expect(instructions.rules.boardDimensions).toContain("7");
  });

  test("explain coins fall to lowest available row", () => {
    const instructions = getGameInstructions();
    expect(instructions.rules.coinDropMechanics).toMatch(/fall|drop|lowest/i);
  });

  test("explain Player 1 goes first then players alternate", () => {
    const instructions = getGameInstructions();
    expect(instructions.rules.turnOrder).toMatch(/player 1.*first/i);
    expect(instructions.rules.turnOrder).toMatch(/alternate/i);
  });
});
