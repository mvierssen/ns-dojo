import {describe, expect, test} from "vitest";
import {resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {getCell} from "./board.js";
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
    const row = board.cells[5];
    if (row) row[0] = CellState.Player1;

    // Get updated display
    const updatedDisplay = game.displayBoard();
    expect(updatedDisplay).toContain("🟡");
    expect(updatedDisplay).not.toBe(initialDisplay);
  });

  test("validate column input and return success for valid input", () => {
    const game = new Game();
    const result = game.validateColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: number}).value).toBe(4);
  });

  test("validate column input and return failure with error message for invalid input", () => {
    const game = new Game();
    const result = game.validateColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
    expect((result as {error: string}).error).toBeDefined();
    expect((result as {error: string}).error.length).toBeGreaterThan(0);
  });

  test("provide meaningful error message for out-of-range column", () => {
    const game = new Game();
    const result = game.validateColumnInput("8");
    expect(resultIsFailure(result)).toBe(true);
    expect((result as {error: string}).error).toMatch(/column|range|1.*7/i);
  });

  test("provide meaningful error message for non-numeric input", () => {
    const game = new Game();
    const result = game.validateColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
    expect((result as {error: string}).error).toMatch(/not a number|numeric/i);
  });

  test("dropCoin updates board state with Player1 coin", () => {
    const game = new Game();
    game.start();

    const result = game.dropCoin(3, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    const board = game.getBoard();
    const cell = getCell(board, {row: 1, column: 3});
    expect(cell).toBe(CellState.Player1);
  });

  test("dropCoin returns success with position for valid move", () => {
    const game = new Game();
    game.start();

    const result = game.dropCoin(5, CellState.Player2);

    expect(resultIsSuccess(result)).toBe(true);
    if (resultIsSuccess(result)) {
      expect(result.value).toEqual({row: 1, column: 5});
    }
  });

  test("dropCoin returns failure for full column", () => {
    const game = new Game();
    game.start();

    // Fill column 2 completely
    const board = game.getBoard();
    for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
      board.cells[rowIndex]![1] = CellState.Player1;
    }

    const result = game.dropCoin(2, CellState.Player2);

    expect(resultIsFailure(result)).toBe(true);
    if (resultIsFailure(result)) {
      expect(result.error).toContain("2");
      expect(result.error).toContain("full");
    }
  });

  test("displayBoard shows dropped coin at correct position", () => {
    const game = new Game();
    game.start();

    game.dropCoin(4, CellState.Player1);
    const display = game.displayBoard();

    // Row 1 should show Player1 coin in column 4
    const lines = display.split("\n");
    const row1Line = lines.find((line) => line.startsWith("1 |"));
    expect(row1Line).toContain("🟡");
  });
});
