import readline from "node:readline/promises";
import {CellState} from "./constants.js";
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

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n\nGoodbye! Thanks for playing Connect 4!");
    rl.close();
    process.exit(0);
  });

  // Game loop
  let isRunning = true;
  while (isRunning) {
    const currentPlayer = gameLoop.getCurrentPlayer();
    const playerSymbol = currentPlayer === CellState.Player1 ? "🟡" : "🔴";
    const playerName = currentPlayer === CellState.Player1 ? "Player 1" : "Player 2";
    const input = await rl.question(`${playerSymbol} ${playerName}, enter column (1-7) or 'q' to quit: `);
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

const scriptPath = process.argv[1] ?? "";
if (import.meta.url === `file://${scriptPath}`) {
  await createCli();
}
