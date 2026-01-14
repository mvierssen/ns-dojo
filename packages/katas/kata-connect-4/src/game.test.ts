import {describe, expect, test} from "vitest";
import {resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {getCell} from "./board.js";
import {validateColumn} from "./column.js";
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
    expect(display).toContain("1  2  3  4  5  6  7");
    expect(display).toContain("⚪");
  });

  test("display board updates after state change", () => {
    const game = new Game();
    game.start();

    // Get initial display
    const initialDisplay = game.displayBoard();
    expect(initialDisplay).toContain("⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");

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

    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = game.dropCoin(col.value, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    const board = game.getBoard();
    const cellResult = getCell(board, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("dropCoin returns success with position for valid move", () => {
    const game = new Game();
    game.start();

    const col = validateColumn(5);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = game.dropCoin(col.value, CellState.Player2);

    expect(resultIsSuccess(result)).toBe(true);
    const successResult = result as {value: {row: number; column: number}};
    expect(successResult.value).toEqual({row: 1, column: 5});
  });

  test("dropCoin returns failure for full column", () => {
    const game = new Game();
    game.start();

    // Fill column 2 completely
    const board = game.getBoard();
    for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
      const row = board.cells[rowIndex];
      if (row === undefined) throw new Error(`Row ${String(rowIndex)} should exist`);
      row[1] = CellState.Player1;
    }

    const col = validateColumn(2);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = game.dropCoin(col.value, CellState.Player2);

    expect(resultIsFailure(result)).toBe(true);
    const failureResult = result as {error: string};
    expect(failureResult.error).toContain("2");
    expect(failureResult.error).toContain("full");
  });

  test("displayBoard shows dropped coin at correct position", () => {
    const game = new Game();
    game.start();

    const col = validateColumn(4);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    game.dropCoin(col.value, CellState.Player1);
    const display = game.displayBoard();

    // Row 1 should show Player1 coin in column 4
    const lines = display.split("\n");
    const row1Line = lines.find((line) => line.startsWith("1 |"));
    expect(row1Line).toContain("🟡");
  });

  test("dropCoin multiple times stacks coins correctly", () => {
    const game = new Game();
    game.start();

    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result1 = game.dropCoin(col.value, CellState.Player1);
    const result2 = game.dropCoin(col.value, CellState.Player2);
    const result3 = game.dropCoin(col.value, CellState.Player1);

    expect(resultIsSuccess(result1)).toBe(true);
    expect(resultIsSuccess(result2)).toBe(true);
    expect(resultIsSuccess(result3)).toBe(true);

    const successResult1 = result1 as {value: {row: number; column: number}};
    const successResult2 = result2 as {value: {row: number; column: number}};
    const successResult3 = result3 as {value: {row: number; column: number}};
    expect(successResult1.value).toEqual({row: 1, column: 3});
    expect(successResult2.value).toEqual({row: 2, column: 3});
    expect(successResult3.value).toEqual({row: 3, column: 3});

    const board = game.getBoard();
    const cell1 = getCell(board, {row: 1, column: 3});
    const cell2 = getCell(board, {row: 2, column: 3});
    const cell3 = getCell(board, {row: 3, column: 3});
    expect(resultIsSuccess(cell1) && cell1.value).toBe(CellState.Player1);
    expect(resultIsSuccess(cell2) && cell2.value).toBe(CellState.Player2);
    expect(resultIsSuccess(cell3) && cell3.value).toBe(CellState.Player1);
  });
});
