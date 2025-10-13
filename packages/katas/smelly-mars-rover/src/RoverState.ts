import type { Heading } from "./types.js";

export class RoverState {
  x = 0;
  y = 0;
  direction: Heading = "N"; // 'char' in C# is effectively a one-character string in TypeScript
}
