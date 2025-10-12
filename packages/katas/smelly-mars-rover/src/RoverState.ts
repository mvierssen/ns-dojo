import type { Heading } from "./types.js";

export class RoverState {
  xx = 0;
  yy = 0;
  dd: Heading = "N"; // 'char' in C# is effectively a one-character string in TypeScript
}
