import {describe, expect, test} from "vitest";
import {createBoard, getAvailableColumns, getCell} from "./board.js";
import {
  CELL_SYMBOLS,
  CellState,
  COLUMN_LABELS,
  ROW_LABELS,
} from "./constants.js";
import {BoardSchema} from "./schemas.js";

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
    const allEmpty = board.cells
      .flat()
      .every((cell) => cell === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("represent empty cells with ◯ symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("◯");
  });

  test("render empty cell as hollow circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("◯");
  });

  test("render player 1 cell as yellow circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Player1]).toBe("🟡");
  });

  test("render player 2 cell as red circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Player2]).toBe("🔴");
  });

  test("label columns 1 through 7 left to right", () => {
    expect(COLUMN_LABELS).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("label rows 1 through 6 bottom to top", () => {
    expect(ROW_LABELS).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("identify position by row and column", () => {
    const board = createBoard();
    const cell = getCell(board, {row: 1, column: 1});
    expect(cell).toBe(CellState.Empty);
  });

  test("have all 7 columns available for coin placement on empty board", () => {
    const board = createBoard();
    const available = getAvailableColumns(board);
    expect(available).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  describe("fail cases", () => {
    test("reject invalid board dimensions", () => {
      const invalid = {cells: [[CellState.Empty]]};
      expect(() => BoardSchema.parse(invalid)).toThrow();
    });
  });
});
