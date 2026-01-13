import {
  resultCreateFailure,
  resultCreateSuccess,
  type Result,
} from "@ns-dojo/shared-core";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CELL_SYMBOLS,
  CellState,
  COLUMN_LABELS,
} from "./constants.js";
import {ColumnInputSchema} from "./schemas.js";
import type {Board, Position} from "./types.js";

export function createBoard(): Board {
  const cells: CellState[][] = [];
  for (let i = 0; i < BOARD_ROWS; i++) {
    const row: CellState[] = [];
    for (let j = 0; j < BOARD_COLUMNS; j++) {
      row.push(CellState.Empty);
    }
    cells.push(row);
  }
  return {cells};
}

export function getCell(board: Board, position: Position): CellState {
  const rowIndex = BOARD_ROWS - position.row;
  const columnIndex = position.column - 1;
  const row = board.cells[rowIndex];
  if (row === undefined) {
    throw new Error(`Invalid row index: ${String(rowIndex)}`);
  }
  const cell = row[columnIndex];
  if (cell === undefined) {
    throw new Error(`Invalid column index: ${String(columnIndex)}`);
  }
  return cell;
}

export function getAvailableColumns(board: Board): number[] {
  return COLUMN_LABELS.filter((column) => {
    const topRow = board.cells[0];
    if (topRow === undefined) return false;
    return topRow[column - 1] === CellState.Empty;
  });
}

export function renderRow(row: CellState[]): string {
  return row.map((cell) => CELL_SYMBOLS[cell]).join(" ");
}

export function renderRowWithLabel(row: CellState[], rowNumber: number): string {
  return `${rowNumber} | ${renderRow(row)}`;
}

export function renderBoard(board: Board): string {
  return board.cells.map((row) => renderRow(row)).join("\n");
}

export function renderBoardWithLabels(board: Board): string {
  const boardRows = renderBoard(board);
  const columnLabels = "    1 2 3 4 5 6 7";
  return `${boardRows}\n${columnLabels}`;
}

export function renderBoardWithRowLabels(board: Board): string {
  return board.cells
    .map((row, index) => {
      const rowNumber = BOARD_ROWS - index;
      return renderRowWithLabel(row, rowNumber);
    })
    .join("\n");
}

export function renderBoardComplete(board: Board): string {
  const boardWithRowLabels = renderBoardWithRowLabels(board);
  const columnLabels = "    1 2 3 4 5 6 7";
  return `${boardWithRowLabels}\n${columnLabels}`;
}

export function parseColumnInput(input: string): Result<number, string> {
  const trimmed = input.trim();
  const parsed = Number(trimmed);

  if (isNaN(parsed)) {
    return resultCreateFailure("Invalid column input: not a number");
  }

  const validation = ColumnInputSchema.safeParse(parsed);

  if (validation.success) {
    return resultCreateSuccess(validation.data);
  }

  if (parsed < 1 || parsed > BOARD_COLUMNS) {
    return resultCreateFailure(`Column must be between 1 and ${BOARD_COLUMNS}`);
  }

  return resultCreateFailure("Invalid column input");
}
