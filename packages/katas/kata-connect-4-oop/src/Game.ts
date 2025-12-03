import {Board} from "./Board.js";
import type {BoardInterface} from "./BoardInterface.js";
import type {GameInterface} from "./GameInterface.js";
import {Instructions} from "./Instructions.js";
import type {GameInstructions} from "./InstructionsInterface.js";

export class Game implements GameInterface {
  private board: Board | null = null;
  private readonly instructions: Instructions;

  constructor() {
    this.instructions = new Instructions();
  }

  start(): void {
    this.board = new Board();
  }

  getBoard(): BoardInterface {
    if (this.board === null) {
      throw new Error("Game has not been started");
    }
    return this.board;
  }

  getInstructions(): GameInstructions {
    return this.instructions.getInstructions();
  }
}
