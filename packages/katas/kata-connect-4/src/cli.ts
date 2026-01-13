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
