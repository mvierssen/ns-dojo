import type {GameInstructions} from "./instructions.js";

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
