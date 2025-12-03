import {describe, expect, test} from "vitest";
import {Board} from "./Board.js";
import {
  CELL_SYMBOLS,
  CellState,
  COLUMN_LABELS,
  ROW_LABELS,
} from "./constants.js";
import {BoardSchema} from "./schemas.js";

describe("BoardShould", () => {
  test("have 6 rows", () => {
    const board = new Board();
    expect(board.getCells().length).toBe(6);
  });

  test("have 7 columns per row", () => {
    const board = new Board();
    expect(board.getCells()[0]?.length).toBe(7);
  });

  test("initialize all 42 positions as empty", () => {
    const board = new Board();
    const allEmpty = board
      .getCells()
      .flat()
      .every((cell) => cell === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("represent empty cells with ◯ symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("◯");
  });

  test("label columns 1 through 7 left to right", () => {
    expect(COLUMN_LABELS).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("label rows 1 through 6 bottom to top", () => {
    expect(ROW_LABELS).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("identify position by row and column", () => {
    const board = new Board();
    const cell = board.getCell({row: 1, column: 1});
    expect(cell).toBe(CellState.Empty);
  });

  test("have all 7 columns available for coin placement on empty board", () => {
    const board = new Board();
    const available = board.getAvailableColumns();
    expect(available).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  describe("fail cases", () => {
    test("reject invalid board dimensions", () => {
      const invalid = {cells: [[CellState.Empty]]};
      expect(() => BoardSchema.parse(invalid)).toThrow();
    });
  });
});
