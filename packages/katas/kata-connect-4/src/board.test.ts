import { describe, expect, test } from "vitest";

import { createBoard } from "./board.js";
import { CELL_SYMBOLS, CellState, COLUMN_LABELS } from "./constants.js";

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

  test("label columns 1 through 7 left to right", () => {
    expect(COLUMN_LABELS).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
