import {createBoard} from "./board-core.js";
import type {Board} from "./types.js";

export interface GameState {
  board: Board;
}

export function initializeGameState(): GameState {
  return {
    board: createBoard(),
  };
}
