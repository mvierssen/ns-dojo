import {describe, expect, test} from "vitest";
import {Instructions} from "./Instructions.js";

describe("InstructionsShould", () => {
  test("include a welcome message", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.welcome).toBeDefined();
    expect(result.welcome.length).toBeGreaterThan(0);
  });

  test("explain board is 6 rows by 7 columns", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.boardDimensions).toContain("6");
    expect(result.rules.boardDimensions).toContain("7");
  });

  test("explain coins fall to lowest available row", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.coinDropMechanics).toMatch(/fall|drop|lowest/i);
  });

  test("explain Player 1 goes first then players alternate", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.turnOrder).toMatch(/player 1.*first/i);
    expect(result.rules.turnOrder).toMatch(/alternate/i);
  });

  test("explain 4-in-a-row wins (horizontal, vertical, diagonal)", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.winCondition).toMatch(/4.*row|four.*row/i);
    expect(result.rules.winCondition).toMatch(/horizontal/i);
    expect(result.rules.winCondition).toMatch(/vertical/i);
    expect(result.rules.winCondition).toMatch(/diagonal/i);
  });

  test("explain draw occurs when board is full with no winner", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.drawCondition).toMatch(/draw|tie/i);
    expect(result.rules.drawCondition).toMatch(/full/i);
  });

  test("clarify columns 1-7 are used for selection", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.rules.columnSelection).toMatch(/1.*7/);
  });

  test("include prompt to start the game", () => {
    const instructions = new Instructions();
    const result = instructions.getInstructions();
    expect(result.startPrompt).toBeDefined();
    expect(result.startPrompt.length).toBeGreaterThan(0);
  });
});
