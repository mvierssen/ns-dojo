import type {Result} from "@ns-dojo/shared-core";
import {resultCreateSuccess, resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {parseColumnInput} from "./board.js";
import {CellState} from "./constants.js";
import type {GameInstructions} from "./instructions.js";
import {createTurnManager, advanceTurn, type TurnManager} from "./turn-manager.js";
import type {Column, IGame} from "./types.js";

export interface GameLoopResponse {
  type: "success" | "error" | "quit" | "win";
  message: string;
}

export class GameLoop {
  private turnManager: TurnManager;

  constructor(private game: IGame) {
    this.turnManager = createTurnManager();
  }

  getWelcomeOutput(): string {
    const instructions = this.game.getInstructions();
    return `${formatWelcome()}\n\n${formatInstructions(instructions)}`;
  }

  getBoardOutput(): string {
    const boardDisplay = this.game.displayBoard();
    return formatBoard(boardDisplay);
  }

  getCurrentPlayer(): CellState {
    return this.turnManager.currentPlayer;
  }

  getPlayerPrompt(): string {
    if (this.turnManager.currentPlayer === CellState.Player1) {
      return "Player 1's turn (🟡)";
    }
    return "Player 2's turn (🔴)";
  }

  handleInput(input: string): GameLoopResponse {
    const parseResult = processColumnInput(input);

    if (resultIsSuccess(parseResult) && parseResult.value === "quit") {
      return {
        type: "quit",
        message: "Goodbye!",
      };
    }

    if (resultIsFailure(parseResult)) {
      return {
        type: "error",
        message: formatError(parseResult.error),
      };
    }

    if (resultIsSuccess(parseResult) && typeof parseResult.value !== "string") {
      const column: Column = parseResult.value;
      const dropResult = this.game.dropCoin(column, this.turnManager.currentPlayer);

      if (resultIsFailure(dropResult)) {
        return {
          type: "error",
          message: formatError(dropResult.error),
        };
      }

      const playerName =
        this.turnManager.currentPlayer === CellState.Player1 ? "Player 1" : "Player 2";

      if (dropResult.value.winner !== null) {
        return {
          type: "win",
          message: `${playerName} wins!`,
        };
      }

      this.turnManager = advanceTurn(this.turnManager);

      return {
        type: "success",
        message: formatSuccess(`${playerName} placed coin in column ${String(column)}`),
      };
    }

    return {type: "success", message: ""};
  }
}

export function formatWelcome(): string {
  return "Welcome to Connect 4!";
}

export function formatInstructions(instructions: GameInstructions): string {
  return `${instructions.welcome}

${instructions.rules.boardDimensions}
${instructions.rules.columnSelection}

${instructions.startPrompt}`;
}

export function formatBoard(boardDisplay: string): string {
  return boardDisplay;
}

export function formatPrompt(player: number): string {
  return `Player ${String(player)}, select a column (1-7):`;
}

export function formatError(message: string): string {
  return `Error: ${message}`;
}

export function formatSuccess(message: string): string {
  return message;
}

export function processColumnInput(input: string): Result<Column | "quit"> {
  const normalized = input.trim().toLowerCase();
  if (normalized === "q" || normalized === "quit") {
    return resultCreateSuccess<Column | "quit">("quit");
  }
  return parseColumnInput(input);
}
