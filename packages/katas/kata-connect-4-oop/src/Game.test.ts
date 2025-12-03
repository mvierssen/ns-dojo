import {describe, expect, test} from "vitest";
import {CellState} from "./constants.js";
import {Game} from "./Game.js";

describe("GameShould", () => {
  test("begin with a fresh board when started", () => {
    const game = new Game();
    game.start();
    const board = game.getBoard();
    const allEmpty = board
      .getCells()
      .flat()
      .every((c) => c === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("provide game instructions", () => {
    const game = new Game();
    const instructions = game.getInstructions();
    expect(instructions.welcome).toBeDefined();
    expect(instructions.rules).toBeDefined();
  });

  test("throw error when getting board before start", () => {
    const game = new Game();
    expect(() => game.getBoard()).toThrow("Game has not been started");
  });
});
