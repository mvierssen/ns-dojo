import {
  resultCreateFailure,
  resultCreateSuccess,
  resultIsSuccess,
  type Result,
} from "@ns-dojo/shared-core";
import {BOARD_ROWS, CellState} from "./constants.js";
import {getCell} from "./board-core.js";
import type {Board, Column, Position} from "./types.js";

export function findLowestEmptyRow(board: Board, column: Column): number | null {
  for (let row = 1; row <= BOARD_ROWS; row++) {
    const cellResult = getCell(board, {row, column});
    if (!resultIsSuccess(cellResult)) {
      return null;
    }
    if (cellResult.value === CellState.Empty) {
      return row;
    }
  }
  return null;
}

export function setCell(board: Board, position: Position, cellState: CellState): Board {
  const rowIndex = BOARD_ROWS - position.row;
  const columnIndex = position.column - 1;

  const newCells = board.cells.map((row, rIdx) =>
    rIdx === rowIndex
      ? row.map((cell, cIdx) => (cIdx === columnIndex ? cellState : cell))
      : row
  );

  return {cells: newCells};
}

export function dropCoin(
  board: Board,
  column: Column,
  player: CellState
): Result<{board: Board; position: Position}> {
  const row = findLowestEmptyRow(board, column);

  if (row === null) {
    return resultCreateFailure(`Column ${String(column)} is full`);
  }

  const position: Position = {row, column};
  const newBoard = setCell(board, position, player);

  return resultCreateSuccess({board: newBoard, position});
}
