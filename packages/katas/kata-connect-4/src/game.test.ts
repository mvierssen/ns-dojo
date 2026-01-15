import {describe, expect, test} from "vitest";
import {resultUnwrapOrThrow, resultUnwrapErrorOrThrow} from "@ns-dojo/shared-core";
import {getCell} from "./board.js";
import {validateColumn} from "./column.js";
import {CellState} from "./constants.js";
import {Game} from "./game.js";
import type {IGame} from "./types.js";

test("Game implements IGame interface", () => {
  const game: IGame = new Game();
  expect(game).toBeDefined();
});

test("Game class explicitly implements IGame", () => {
  const game: IGame = new Game();
  game.start();

  expect(game.getBoard()).toBeDefined();
  expect(game.getInstructions()).toBeDefined();
  expect(game.displayBoard()).toBeDefined();
});

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

    const initialDisplay = game.displayBoard();
    expect(initialDisplay).toContain("⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");

    const col = resultUnwrapOrThrow(validateColumn(1));
    game.dropCoin(col, CellState.Player1);

    const updatedDisplay = game.displayBoard();
    expect(updatedDisplay).toContain("🟡");
    expect(updatedDisplay).not.toBe(initialDisplay);
  });

  test("validate column input and return success for valid input", () => {
    const game = new Game();
    const result = resultUnwrapOrThrow(game.validateColumnInput("4"));
    expect(result).toBe(4);
  });

  test("validate column input and return failure with error message for invalid input", () => {
    const game = new Game();
    const error = resultUnwrapErrorOrThrow(game.validateColumnInput("abc"));
    expect(error).toBeDefined();
    expect(error.length).toBeGreaterThan(0);
  });

  test("provide meaningful error message for out-of-range column", () => {
    const game = new Game();
    const error = resultUnwrapErrorOrThrow(game.validateColumnInput("8"));
    expect(error).toMatch(/column|range|1.*7/i);
  });

  test("provide meaningful error message for non-numeric input", () => {
    const game = new Game();
    const error = resultUnwrapErrorOrThrow(game.validateColumnInput("abc"));
    expect(error).toMatch(/not a number|numeric/i);
  });

  test("dropCoin updates board state with Player1 coin", () => {
    const game = new Game();
    game.start();

    const col = resultUnwrapOrThrow(validateColumn(3));
    resultUnwrapOrThrow(game.dropCoin(col, CellState.Player1));

    const board = game.getBoard();
    expect(resultUnwrapOrThrow(getCell(board, {row: 1, column: 3}))).toBe(CellState.Player1);
  });

  test("dropCoin returns success with position for valid move", () => {
    const game = new Game();
    game.start();

    const col = resultUnwrapOrThrow(validateColumn(5));
    const result = resultUnwrapOrThrow(game.dropCoin(col, CellState.Player2));

    expect(result.position).toEqual({row: 1, column: 5});
  });

  test("dropCoin returns failure for full column", () => {
    const game = new Game();
    game.start();

    const col = resultUnwrapOrThrow(validateColumn(2));
    for (let i = 0; i < 6; i++) {
      game.dropCoin(col, CellState.Player1);
    }

    const error = resultUnwrapErrorOrThrow(game.dropCoin(col, CellState.Player2));
    expect(error).toContain("2");
    expect(error).toContain("full");
  });

  test("displayBoard shows dropped coin at correct position", () => {
    const game = new Game();
    game.start();

    const col = resultUnwrapOrThrow(validateColumn(4));
    game.dropCoin(col, CellState.Player1);
    const display = game.displayBoard();

    const lines = display.split("\n");
    const row1Line = lines.find((line) => line.startsWith("1 |"));
    expect(row1Line).toContain("🟡");
  });

  test("dropCoin multiple times stacks coins correctly", () => {
    const game = new Game();
    game.start();

    const col = resultUnwrapOrThrow(validateColumn(3));
    const result1 = resultUnwrapOrThrow(game.dropCoin(col, CellState.Player1));
    const result2 = resultUnwrapOrThrow(game.dropCoin(col, CellState.Player2));
    const result3 = resultUnwrapOrThrow(game.dropCoin(col, CellState.Player1));

    expect(result1.position).toEqual({row: 1, column: 3});
    expect(result2.position).toEqual({row: 2, column: 3});
    expect(result3.position).toEqual({row: 3, column: 3});

    const board = game.getBoard();
    expect(resultUnwrapOrThrow(getCell(board, {row: 1, column: 3}))).toBe(CellState.Player1);
    expect(resultUnwrapOrThrow(getCell(board, {row: 2, column: 3}))).toBe(CellState.Player2);
    expect(resultUnwrapOrThrow(getCell(board, {row: 3, column: 3}))).toBe(CellState.Player1);
  });

  test("detect win after dropCoin", () => {
    const game = new Game();
    game.start();

    const col1 = resultUnwrapOrThrow(validateColumn(1));
    const col2 = resultUnwrapOrThrow(validateColumn(2));
    const col3 = resultUnwrapOrThrow(validateColumn(3));
    const col4 = resultUnwrapOrThrow(validateColumn(4));

    game.dropCoin(col1, CellState.Player1);
    game.dropCoin(col2, CellState.Player1);
    game.dropCoin(col3, CellState.Player1);
    const result = resultUnwrapOrThrow(game.dropCoin(col4, CellState.Player1));

    expect(result.winner).toBe(CellState.Player1);
  });
});
