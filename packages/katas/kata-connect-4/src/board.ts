import { BOARD_COLUMNS, BOARD_ROWS, CellState } from "./constants.js";
import type { Board } from "./types.js";

export function createBoard(): Board {
  const cells: CellState[][] = [];
  for (let i = 0; i < BOARD_ROWS; i++) {
    const row: CellState[] = [];
    for (let j = 0; j < BOARD_COLUMNS; j++) {
      row.push(CellState.Empty);
    }
    cells.push(row);
  }
  return { cells };
}
