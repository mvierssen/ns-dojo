import {describe, expect, test} from "vitest";
import * as main from "./main.js";
import {Game} from "./game.js";
import {GameLoop} from "./cli.js";

describe("MainEntrypointShould", () => {
  test("export createCli function", () => {
    expect(main.createCli).toBeDefined();
    expect(typeof main.createCli).toBe("function");
  });

  test("import required modules", async () => {
    // Verify imports by checking the module can be loaded
    const module = await import("./main.js");
    expect(module).toBeDefined();
  });

  test("create and start game when executed", () => {
    // This tests the setup logic exists
    // We can't easily test the interactive loop without mocking readline
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    expect(gameLoop).toBeDefined();
    expect(game.getBoard()).toBeDefined();
  });
});
