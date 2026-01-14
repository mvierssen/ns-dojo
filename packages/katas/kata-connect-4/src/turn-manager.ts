import {CellState} from "./constants.js";

export interface TurnManager {
  currentPlayer: CellState;
}

export function createTurnManager(): TurnManager {
  return {
    currentPlayer: CellState.Player1,
  };
}
