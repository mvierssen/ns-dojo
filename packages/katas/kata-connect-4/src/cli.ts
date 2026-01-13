import type {Result} from "@ns-dojo/shared-core";
import {resultCreateSuccess} from "@ns-dojo/shared-core";
import {parseColumnInput} from "./board.js";
import type {Game} from "./game.js";
import type {GameInstructions} from "./instructions.js";

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
  return `Player ${player}, select a column (1-7):`;
}

export function formatError(message: string): string {
  return `Error: ${message}`;
}

export function formatSuccess(message: string): string {
  return message;
}

export function processColumnInput(input: string): Result<number | "quit", string> {
  const normalized = input.trim().toLowerCase();
  if (normalized === "q" || normalized === "quit") {
    return resultCreateSuccess("quit");
  }
  return parseColumnInput(input);
}
