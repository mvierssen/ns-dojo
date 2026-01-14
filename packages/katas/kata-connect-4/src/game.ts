import type {Result} from "@ns-dojo/shared-core";
import {resultCreateFailure, resultCreateSuccess, resultIsSuccess} from "@ns-dojo/shared-core";
import {parseColumnInput, renderBoardComplete} from "./board.js";
import type {CellState} from "./constants.js";
import {initializeGameState, processMove, type GameState} from "./game-state.js";
import {getGameInstructions, type GameInstructions} from "./instructions.js";
import type {Board, Position} from "./types.js";

// Facade Class
export class Game {
  private gameState: GameState | null = null;

  start(): void {
    this.gameState = initializeGameState();
  }

  getBoard(): Board {
    if (this.gameState === null) {
      throw new Error("Game has not been started");
    }
    return this.gameState.board;
  }

  getInstructions(): GameInstructions {
    return getGameInstructions();
  }

  displayBoard(): string {
    if (this.gameState === null) {
      throw new Error("Game has not been started");
    }
    return renderBoardComplete(this.gameState.board);
  }

  validateColumnInput(input: string): Result<number> {
    return parseColumnInput(input);
  }

  dropCoin(column: number, player: CellState): Result<Position> {
    if (this.gameState === null) {
      return resultCreateFailure("Game has not been started");
    }

    const result = processMove(this.gameState, column, player);

    if (resultIsSuccess(result)) {
      this.gameState = result.value.gameState;
      return resultCreateSuccess(result.value.position);
    }

    return resultCreateFailure(result.error);
  }
}
