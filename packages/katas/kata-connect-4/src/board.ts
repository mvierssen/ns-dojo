import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CellState,
  COLUMN_LABELS,
} from "./constants.js";
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
