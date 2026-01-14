import {describe, expect, test} from "vitest";
import {resultIsSuccess, resultIsFailure} from "@ns-dojo/shared-core";
import {
  createBoard,
  dropCoin,
  findLowestEmptyRow,
  getAvailableColumns,
  getCell,
  parseColumnInput,
  renderBoard,
  renderBoardComplete,
  renderBoardWithLabels,
  renderBoardWithRowLabels,
  renderRow,
  renderRowWithLabel,
  setCell,
} from "./board.js";
import {validateColumn} from "./column.js";
import type {Position} from "./types.js";
import {
  BOARD_ROWS,
  CELL_SYMBOLS,
  CellState,
  COLUMN_LABELS,
  COLUMN_LABELS_STRING,
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

  test("represent empty cells with ⚪ symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("⚪");
  });

  test("render empty cell as hollow circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Empty]).toBe("⚪");
  });

  test("render player 1 cell as yellow circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Player1]).toBe("🟡");
  });

  test("render player 2 cell as red circle symbol", () => {
    expect(CELL_SYMBOLS[CellState.Player2]).toBe("🔴");
  });

  test("render single row of empty cells with 7 symbols", () => {
    const row: CellState[] = Array.from({length: 7}, () => CellState.Empty);
    const rendered = renderRow(row);
    expect(rendered).toBe("⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");
  });

  test("render row with mixed cell states", () => {
    const row: CellState[] = [
      CellState.Player1,
      CellState.Empty,
      CellState.Player2,
      CellState.Empty,
      CellState.Player1,
      CellState.Player2,
      CellState.Empty,
    ];
    const rendered = renderRow(row);
    expect(rendered).toBe("🟡 ⚪ 🔴 ⚪ 🟡 🔴 ⚪");
  });

  test("render row with row number label on left side", () => {
    const row: CellState[] = Array.from({length: 7}, () => CellState.Empty);
    const rowNumber = 3;
    const rendered = renderRowWithLabel(row, rowNumber);
    expect(rendered).toBe("3 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");
  });

  test("render empty board with all 6 rows", () => {
    const board = createBoard();
    const rendered = renderBoard(board);
    const lines = rendered.split("\n");
    expect(lines.length).toBe(6);
    expect(lines[0]).toContain("⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");
  });

  test("render board with column labels at bottom", () => {
    const board = createBoard();
    const rendered = renderBoardWithLabels(board);
    const lines = rendered.split("\n");
    expect(lines.at(-1)).toBe("    1  2  3  4  5  6  7");
  });

  test("use COLUMN_LABELS_STRING constant for column labels", () => {
    const board = createBoard();
    const rendered = renderBoardWithLabels(board);
    const lines = rendered.split("\n");
    expect(lines.at(-1)).toBe(COLUMN_LABELS_STRING);
  });

  test("render rows in correct order with row 6 at top and row 1 at bottom", () => {
    const board = createBoard();
    const rendered = renderBoardWithRowLabels(board);
    const lines = rendered.split("\n");
    expect(lines[0]).toContain("6 |");
    expect(lines[5]).toContain("1 |");
  });

  test("render board with coins at correct positions", () => {
    const board = createBoard();
    // Manually place coins: Player1 at (1,1), Player2 at (1,2)
    // Row 1 is at index 5, columns are 0-indexed in array
    const row = board.cells[5];
    if (row) {
      row[0] = CellState.Player1;
      row[1] = CellState.Player2;
    }

    const rendered = renderBoardComplete(board);
    const lines = rendered.split("\n");

    // Row 1 should contain Player1 (🟡) and Player2 (🔴) coins
    expect(lines[5]).toContain("1 | 🟡 🔴");
    // Column labels should be present at bottom
    expect(lines[6]).toBe("    1  2  3  4  5  6  7");
  });

  test("use COLUMN_LABELS_STRING constant in complete board render", () => {
    const board = createBoard();
    const rendered = renderBoardComplete(board);
    const lines = rendered.split("\n");
    expect(lines.at(-1)).toBe(COLUMN_LABELS_STRING);
  });

  test("label columns 1 through 7 left to right", () => {
    expect(COLUMN_LABELS).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("label rows 1 through 6 bottom to top", () => {
    expect(ROW_LABELS).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("identify position by row and column", () => {
    const board = createBoard();
    const result = getCell(board, {row: 1, column: 1});
    expect(resultIsSuccess(result) && result.value).toBe(CellState.Empty);
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

describe("ColumnInputParsingShould", () => {
  test("return success for valid column '4'", () => {
    const result = parseColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: number}).value).toBe(4);
  });

  test("return success for column '1' (min)", () => {
    const result = parseColumnInput("1");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: number}).value).toBe(1);
  });

  test("return success for column '7' (max)", () => {
    const result = parseColumnInput("7");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: number}).value).toBe(7);
  });

  test("return failure for '0'", () => {
    const result = parseColumnInput("0");
    expect(resultIsSuccess(result)).toBe(false);
  });

  test("return failure for '8'", () => {
    const result = parseColumnInput("8");
    expect(resultIsSuccess(result)).toBe(false);
  });

  test("return failure for non-numeric 'abc'", () => {
    const result = parseColumnInput("abc");
    expect(resultIsSuccess(result)).toBe(false);
  });

  test("return failure for empty string", () => {
    const result = parseColumnInput("");
    expect(resultIsSuccess(result)).toBe(false);
  });

  test("return failure for decimal '3.5'", () => {
    const result = parseColumnInput("3.5");
    expect(resultIsSuccess(result)).toBe(false);
  });
});

describe("FindLowestEmptyRowShould", () => {
  test("return row 1 for empty column", () => {
    const board = createBoard();
    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const lowestRow = findLowestEmptyRow(board, col.value);
    expect(lowestRow).toBe(1);
  });

  test("return row 2 when row 1 is occupied", () => {
    const board = createBoard();
    // Manually place coin at row 1, column 3 (array index: cells[5][2])
    const row = board.cells[5];
    if (row) row[2] = CellState.Player1;

    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const lowestRow = findLowestEmptyRow(board, col.value);
    expect(lowestRow).toBe(2);
  });

  test("return row 6 when rows 1-5 are occupied", () => {
    const board = createBoard();
    // Fill column 4 from row 1 to row 5
    // Row 1: cells[5][3], Row 2: cells[4][3], ..., Row 5: cells[1][3]
    for (let rowIndex = 5; rowIndex >= 1; rowIndex--) {
      const row = board.cells[rowIndex];
      if (row) row[3] = CellState.Player1;
    }

    const col = validateColumn(4);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const lowestRow = findLowestEmptyRow(board, col.value);
    expect(lowestRow).toBe(6);
  });

  test("return null when column is full", () => {
    const board = createBoard();
    // Fill entire column 2 (all 6 rows)
    for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
      const row = board.cells[rowIndex];
      if (row) row[1] = CellState.Player2;
    }

    const col = validateColumn(2);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const lowestRow = findLowestEmptyRow(board, col.value);
    expect(lowestRow).toBe(null);
  });

  test("handle Result from getCell correctly", () => {
    const board = createBoard();
    const col = validateColumn(1);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = findLowestEmptyRow(board, col.value);

    expect(result).toBe(1);
  });
});

describe("SetCellShould", () => {
  test("place Player1 coin at specified position", () => {
    const board = createBoard();
    const position: Position = {row: 1, column: 3};
    const newBoard = setCell(board, position, CellState.Player1);

    const cellResult = getCell(newBoard, position);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("place Player2 coin at specified position", () => {
    const board = createBoard();
    const position: Position = {row: 2, column: 5};
    const newBoard = setCell(board, position, CellState.Player2);

    const cellResult = getCell(newBoard, position);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player2);
  });

  test("return new board without mutating original", () => {
    const board = createBoard();
    const position: Position = {row: 1, column: 1};
    const originalResult = getCell(board, position);
    const originalCell = resultIsSuccess(originalResult) ? originalResult.value : null;

    const newBoard = setCell(board, position, CellState.Player1);

    // Original board should be unchanged
    const originalResultAfter = getCell(board, position);
    const originalCellAfter = resultIsSuccess(originalResultAfter) ? originalResultAfter.value : null;
    expect(originalCellAfter).toBe(originalCell);
    expect(originalCellAfter).toBe(CellState.Empty);

    // New board should have the change
    const newResult = getCell(newBoard, position);
    expect(resultIsSuccess(newResult) && newResult.value).toBe(CellState.Player1);
  });

  test("work correctly at position row 1 column 1 (corner)", () => {
    const board = createBoard();
    const position: Position = {row: 1, column: 1};
    const newBoard = setCell(board, position, CellState.Player1);

    const cellResult = getCell(newBoard, position);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);

    // Verify other cells remain empty
    const adjacentResult = getCell(newBoard, {row: 1, column: 2});
    expect(resultIsSuccess(adjacentResult) && adjacentResult.value).toBe(CellState.Empty);
  });

  test("work correctly at position row 6 column 7 (opposite corner)", () => {
    const board = createBoard();
    const position: Position = {row: 6, column: 7};
    const newBoard = setCell(board, position, CellState.Player2);

    const cellResult = getCell(newBoard, position);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player2);

    // Verify other cells remain empty
    const adjacentResult = getCell(newBoard, {row: 6, column: 6});
    expect(resultIsSuccess(adjacentResult) && adjacentResult.value).toBe(CellState.Empty);
  });

  test("work correctly with Result-based getCell", () => {
    const board = createBoard();
    const position: Position = {row: 1, column: 1};
    const newBoard = setCell(board, position, CellState.Player1);

    const cellResult = getCell(newBoard, position);
    expect(resultIsSuccess(cellResult)).toBe(true);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });
});

describe("GetCellShould", () => {
  test("return success with cell state for valid position", () => {
    const board = createBoard();
    const result = getCell(board, {row: 1, column: 1});

    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value).toBe(CellState.Empty);
  });

  test("return failure for invalid row index", () => {
    const board = createBoard();
    const result = getCell(board, {row: 10, column: 1});

    expect(resultIsFailure(result)).toBe(true);
    expect(resultIsFailure(result) && result.error).toContain("Invalid row");
  });

  test("return failure for invalid column index", () => {
    const board = createBoard();
    const result = getCell(board, {row: 1, column: 10});

    expect(resultIsFailure(result)).toBe(true);
    expect(resultIsFailure(result) && result.error).toContain("Invalid column");
  });
});

describe("DropCoinShould", () => {
  test("place coin at row 1 in empty column", () => {
    const board = createBoard();
    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    const successResult = result as {value: {board: typeof board; position: Position}};
    const cellResult = getCell(successResult.value.board, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("place coin at row 2 when row 1 is occupied", () => {
    const board = createBoard();
    // Place a coin at row 1, column 4
    const row5 = board.cells[5];
    if (row5 === undefined) throw new Error("Row 5 should exist");
    row5[3] = CellState.Player1;

    const col = validateColumn(4);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player2);

    expect(resultIsSuccess(result)).toBe(true);
    const successResult = result as {value: {board: typeof board; position: Position}};
    const cellResult = getCell(successResult.value.board, {row: 2, column: 4});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player2);
  });

  test("return success with updated board and position", () => {
    const board = createBoard();
    const col = validateColumn(5);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    const successResult = result as {value: {board: typeof board; position: Position}};
    expect(successResult.value.board).toBeDefined();
    expect(successResult.value.position).toEqual({row: 1, column: 5});
  });

  test("return failure when column is full", () => {
    const board = createBoard();
    // Fill entire column 2
    for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
      const row = board.cells[rowIndex];
      if (row === undefined) throw new Error(`Row ${String(rowIndex)} should exist`);
      row[1] = CellState.Player1;
    }

    const col = validateColumn(2);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player2);

    expect(resultIsFailure(result)).toBe(true);
  });

  test("failure message indicates which column is full", () => {
    const board = createBoard();
    // Fill entire column 7
    for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
      const row = board.cells[rowIndex];
      if (row === undefined) throw new Error(`Row ${String(rowIndex)} should exist`);
      row[6] = CellState.Player1;
    }

    const col = validateColumn(7);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player2);

    expect(resultIsFailure(result)).toBe(true);
    const failureResult = result as {error: string};
    expect(failureResult.error).toContain("7");
    expect(failureResult.error).toContain("full");
  });

  test("not modify original board", () => {
    const board = createBoard();
    const originalResult = getCell(board, {row: 1, column: 3});
    const originalCell = resultIsSuccess(originalResult) ? originalResult.value : null;

    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = dropCoin(board, col.value, CellState.Player1);

    // Original board should be unchanged
    const cellAfterResult = getCell(board, {row: 1, column: 3});
    const cellAfter = resultIsSuccess(cellAfterResult) ? cellAfterResult.value : null;
    expect(cellAfter).toBe(originalCell);
    expect(cellAfter).toBe(CellState.Empty);

    // Result should have new board with coin
    expect(resultIsSuccess(result)).toBe(true);
    const successResult = result as {value: {board: typeof board; position: Position}};
    const newCellResult = getCell(successResult.value.board, {row: 1, column: 3});
    expect(resultIsSuccess(newCellResult) && newCellResult.value).toBe(CellState.Player1);
  });
});
