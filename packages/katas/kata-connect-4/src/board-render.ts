import {
  BOARD_ROWS,
  CELL_SYMBOLS,
  COLUMN_LABELS_STRING,
} from "./constants.js";
import type {CellState} from "./constants.js";
import type {Board} from "./types.js";

export function renderRow(row: CellState[]): string {
  return row.map((cell) => CELL_SYMBOLS[cell]).join(" ");
}

export function renderRowWithLabel(row: CellState[], rowNumber: number): string {
  return `${String(rowNumber)} | ${renderRow(row)}`;
}

export function renderBoard(board: Board): string {
  return board.cells.map((row) => renderRow(row)).join("\n");
}

export function renderBoardWithLabels(board: Board): string {
  const boardRows = renderBoard(board);
  const columnLabels = COLUMN_LABELS_STRING;
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
  const columnLabels = COLUMN_LABELS_STRING;
  return `${boardWithRowLabels}\n${columnLabels}`;
}
