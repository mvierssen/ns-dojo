import type {Board, Position} from "./types.js";
import {getCell} from "./board-core.js";
import {resultIsSuccess} from "@ns-dojo/shared-core";
import type {CellState} from "./constants.js";

export function checkHorizontalWin(
  board: Board,
  position: Position,
  player: CellState
): boolean {
  const {row} = position;
  let count = 0;

  // Count consecutive cells in the row
  for (let col = 1; col <= 7; col++) {
    const cellResult = getCell(board, {row, column: col});
    if (resultIsSuccess(cellResult) && cellResult.value === player) {
      count++;
      if (count >= 4) return true;
    } else {
      count = 0;
    }
  }

  return false;
}
