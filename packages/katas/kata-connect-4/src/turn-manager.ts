import {CellState} from "./constants.js";

export interface TurnManager {
  currentPlayer: CellState;
}

export function createTurnManager(): TurnManager {
  return {
    currentPlayer: CellState.Player1,
  };
}

export function advanceTurn(turnManager: TurnManager): TurnManager {
  return {
    currentPlayer:
      turnManager.currentPlayer === CellState.Player1
        ? CellState.Player2
        : CellState.Player1,
  };
}
