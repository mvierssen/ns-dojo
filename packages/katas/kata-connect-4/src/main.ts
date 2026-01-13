import readline from "node:readline/promises";
import {Game} from "./game.js";
import {GameLoop} from "./cli.js";

export function createCli(): void {
  // Stub - will implement in next steps
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createCli();
}
