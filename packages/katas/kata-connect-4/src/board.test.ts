import { describe, expect, test } from "vitest";

import { createBoard } from "./board.js";
import { CELL_SYMBOLS, CellState } from "./constants.js";

describe("BoardShould", () => {
  test("have 6 rows", () => {
    const board = createBoard();
    expect(board.cells.length).toBe(6);
  });

  test("have 7 columns per row", () => {
    const board = createBoard();
    expect(board.cells[0]?.length).toBe(7);
  });

  test("initialize all 42 positions as empty", () => {
    const board = createBoard();
    const allEmpty = board.cells.flat().every((cell) => cell === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("represent empty cells with ◯ symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("◯");
  });
});
