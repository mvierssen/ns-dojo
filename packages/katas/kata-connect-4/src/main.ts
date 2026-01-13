import readline from "node:readline/promises";
import {Game} from "./game.js";
import {GameLoop} from "./cli.js";

export async function createCli(): Promise<void> {
  const game = new Game();
  game.start();
  const gameLoop = new GameLoop(game);

  // Display welcome
  console.log(gameLoop.getWelcomeOutput());
  console.log("\n");
  console.log(gameLoop.getBoardOutput());
  console.log("\n");

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Game loop
  let isRunning = true;
  while (isRunning) {
    const input = await rl.question("Enter column (1-7) or 'q' to quit: ");
    const response = gameLoop.handleInput(input);

    console.log(response.message);

    if (response.type === "quit") {
      isRunning = false;
    } else if (response.type === "success") {
      console.log("\n");
      console.log(gameLoop.getBoardOutput());
      console.log("\n");
    }
  }

  rl.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createCli().catch((error) => {
    console.error("Error running CLI:", error);
    process.exit(1);
  });
}
