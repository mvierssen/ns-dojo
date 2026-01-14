import {
  resultCreateFailure,
  resultCreateSuccess,
  resultIsSuccess,
  type Result,
} from "@ns-dojo/shared-core";
import {createBoard} from "./board-core.js";
import {dropCoin} from "./board-logic.js";
import type {CellState} from "./constants.js";
import type {Board, Position} from "./types.js";

export interface GameState {
  board: Board;
}

export function initializeGameState(): GameState {
  return {
    board: createBoard(),
  };
}

export function processMove(
  gameState: GameState,
  column: number,
  player: CellState
): Result<{gameState: GameState; position: Position}> {
  const dropResult = dropCoin(gameState.board, column, player);

  if (!resultIsSuccess(dropResult)) {
    return resultCreateFailure(dropResult.error);
  }

  return resultCreateSuccess({
    gameState: {
      board: dropResult.value.board,
    },
    position: dropResult.value.position,
  });
}
