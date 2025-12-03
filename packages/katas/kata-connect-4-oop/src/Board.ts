import type {BoardInterface} from "./BoardInterface.js";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CellState,
  COLUMN_LABELS,
} from "./constants.js";
import type {Position} from "./types.js";

export class Board implements BoardInterface {
  private readonly cells: CellState[][];

  constructor() {
    this.cells = this.createEmptyCells();
  }

  private createEmptyCells(): CellState[][] {
    const cells: CellState[][] = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
      const row: CellState[] = [];
      for (let j = 0; j < BOARD_COLUMNS; j++) {
        row.push(CellState.Empty);
      }
      cells.push(row);
    }
    return cells;
  }

  getCell(position: Position): CellState {
    const rowIndex = BOARD_ROWS - position.row;
    const columnIndex = position.column - 1;
    const row = this.cells[rowIndex];
    if (row === undefined) {
      throw new Error(`Invalid row index: ${String(rowIndex)}`);
    }
    const cell = row[columnIndex];
    if (cell === undefined) {
      throw new Error(`Invalid column index: ${String(columnIndex)}`);
    }
    return cell;
  }

  getAvailableColumns(): number[] {
    return COLUMN_LABELS.filter((column) => {
      const topRow = this.cells[0];
      if (topRow === undefined) return false;
      return topRow[column - 1] === CellState.Empty;
    });
  }

  getCells(): readonly (readonly CellState[])[] {
    return this.cells;
  }
}
