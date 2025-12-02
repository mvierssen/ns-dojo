import { BOARD_ROWS } from "./constants.js";
import type { Board } from "./types.js";

export function createBoard(): Board {
  const cells: string[][] = [];
  for (let i = 0; i < BOARD_ROWS; i++) {
    cells.push([]);
  }
  return { cells };
}
