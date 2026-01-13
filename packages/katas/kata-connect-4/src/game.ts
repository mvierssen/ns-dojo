import type {Result} from "@ns-dojo/shared-core";
import {resultCreateFailure, resultCreateSuccess, resultIsSuccess} from "@ns-dojo/shared-core";
import {createBoard, dropCoin, parseColumnInput, renderBoardComplete} from "./board.js";
import type {CellState} from "./constants.js";
import {getGameInstructions, type GameInstructions} from "./instructions.js";
import type {Board, Position} from "./types.js";

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

  validateColumnInput(input: string): Result<number> {
    return parseColumnInput(input);
  }

  dropCoin(column: number, player: CellState): Result<Position, string> {
    if (this.board === null) {
      return resultCreateFailure("Game has not been started");
    }

    const result = dropCoin(this.board, column, player);

    if (resultIsSuccess(result)) {
      this.board = result.value.board;
      return resultCreateSuccess(result.value.position);
    }

    return resultCreateFailure(result.error);
  }
}
