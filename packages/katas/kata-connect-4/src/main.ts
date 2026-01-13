import readline from "node:readline/promises";
import {Game} from "./game.js";
import {GameLoop} from "./cli.js";

export function createCli(): void {
  const game = new Game();
  game.start();
  const gameLoop = new GameLoop(game);

  // Display welcome
  console.log(gameLoop.getWelcomeOutput());
  console.log("\n");
  console.log(gameLoop.getBoardOutput());
  console.log("\n");

  // Readline setup will be added in next step
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createCli();
}
