import type { Direction } from "./types.js";

export class LegacyRoverState {
  x = 0;
  y = 0;
  direction: Direction = "N"; // 'char' in C# is effectively a one-character string in TypeScript
}
