import {describe, expect, test} from "vitest";
import {resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {CellState} from "./constants.js";
import {Game} from "./game.js";

describe("GameShould", () => {
  test("begin with a fresh board when started", () => {
    const game = new Game();
    game.start();
    const board = game.getBoard();
    const allEmpty = board.cells.flat().every((c) => c === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("provide game instructions", () => {
    const game = new Game();
    const instructions = game.getInstructions();
    expect(instructions.welcome).toBeDefined();
    expect(instructions.rules).toBeDefined();
  });

  test("display board state", () => {
    const game = new Game();
    game.start();
    const display = game.displayBoard();

    expect(display).toContain("6 |");
    expect(display).toContain("1 |");
    expect(display).toContain("1 2 3 4 5 6 7");
    expect(display).toContain("◯");
  });

  test("display board updates after state change", () => {
    const game = new Game();
    game.start();

    // Get initial display
    const initialDisplay = game.displayBoard();
    expect(initialDisplay).toContain("◯ ◯ ◯ ◯ ◯ ◯ ◯");

    // Manually modify board for testing (will be replaced with proper move method later)
    const board = game.getBoard();
    board.cells[5]![0] = CellState.Player1;

    // Get updated display
    const updatedDisplay = game.displayBoard();
    expect(updatedDisplay).toContain("🟡");
    expect(updatedDisplay).not.toBe(initialDisplay);
  });

  test("validate column input and return success for valid input", () => {
    const game = new Game();
    const result = game.validateColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    if (resultIsSuccess(result)) {
      expect(result.value).toBe(4);
    }
  });

  test("validate column input and return failure with error message for invalid input", () => {
    const game = new Game();
    const result = game.validateColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
    if (resultIsFailure(result)) {
      expect(result.error).toBeDefined();
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  test("provide meaningful error message for out-of-range column", () => {
    const game = new Game();
    const result = game.validateColumnInput("8");
    expect(resultIsFailure(result)).toBe(true);
    if (resultIsFailure(result)) {
      expect(result.error).toMatch(/column|range|1.*7/i);
    }
  });

  test("provide meaningful error message for non-numeric input", () => {
    const game = new Game();
    const result = game.validateColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
    if (resultIsFailure(result)) {
      expect(result.error).toMatch(/not a number|numeric/i);
    }
  });
});
