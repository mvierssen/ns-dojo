import type {Result} from "@ns-dojo/shared-core";
import {resultCreateSuccess, resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {parseColumnInput} from "./board.js";
import type {Game} from "./game.js";
import type {GameInstructions} from "./instructions.js";

export interface GameLoopResponse {
  type: "success" | "error" | "quit";
  message: string;
}

export class GameLoop {
  constructor(private game: Game) {}

  getWelcomeOutput(): string {
    const instructions = this.game.getInstructions();
    return `${formatWelcome()}\n\n${formatInstructions(instructions)}`;
  }

  getBoardOutput(): string {
    const boardDisplay = this.game.displayBoard();
    return formatBoard(boardDisplay);
  }

  handleInput(input: string): GameLoopResponse {
    const result = processColumnInput(input);
    if (resultIsSuccess(result) && typeof result.value === "number") {
      return {
        type: "success",
        message: formatSuccess(`Coin placed in column ${String(result.value)}`),
      };
    }
    if (resultIsFailure(result)) {
      return {
        type: "error",
        message: formatError(result.error),
      };
    }
    if (resultIsSuccess(result) && result.value === "quit") {
      return {
        type: "quit",
        message: "Goodbye!",
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

export function processColumnInput(input: string): Result<number | "quit"> {
  const normalized = input.trim().toLowerCase();
  if (normalized === "q" || normalized === "quit") {
    return resultCreateSuccess<number | "quit">("quit");
  }
  return parseColumnInput(input);
}
