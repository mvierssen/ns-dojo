import type {Result} from "@ns-dojo/shared-core";
import {createBoard, parseColumnInput, renderBoardComplete} from "./board.js";
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

  displayBoard(): string {
    if (this.board === null) {
      throw new Error("Game has not been started");
    }
    return renderBoardComplete(this.board);
  }

  validateColumnInput(input: string): Result<number, string> {
    return parseColumnInput(input);
  }
}
