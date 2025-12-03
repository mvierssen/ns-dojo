import {createBoard} from "./board.js";
import {getGameInstructions, type GameInstructions} from "./instructions.js";
import type {Board} from "./types.js";

// Facade Class
export class Game {
  private board: Board | null = null;

  start(): void {
    this.board = createBoard();
  }

  getBoard(): Board {
    if (this.board === null) {
      throw new Error("Game has not been started");
    }
    return this.board;
  }

  getInstructions(): GameInstructions {
    return getGameInstructions();
  }
}
