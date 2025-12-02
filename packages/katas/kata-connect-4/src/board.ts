import { BOARD_COLUMNS, BOARD_ROWS } from "./constants.js";
import type { Board } from "./types.js";

export function createBoard(): Board {
  const cells: string[][] = [];
  for (let i = 0; i < BOARD_ROWS; i++) {
    const row: string[] = [];
    for (let j = 0; j < BOARD_COLUMNS; j++) {
      row.push("");
    }
    cells.push(row);
  }
  return { cells };
}
