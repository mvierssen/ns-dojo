import {describe, expect, test} from "vitest";
import {CellState} from "./constants.js";
import {Game} from "./game.js";

describe("GameShould", () => {
  test("begin with a fresh board when started", () => {
    const game = new Game();
    game.start();
    const board = game.getBoard();
    const allEmpty = board.cells.flat().every((c) => c === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("provide game instructions", () => {
    const game = new Game();
    const instructions = game.getInstructions();
    expect(instructions.welcome).toBeDefined();
    expect(instructions.rules).toBeDefined();
  });

  test("display board state", () => {
    const game = new Game();
    game.start();
    const display = game.displayBoard();

    expect(display).toContain("6 |");
    expect(display).toContain("1 |");
    expect(display).toContain("1 2 3 4 5 6 7");
    expect(display).toContain("◯");
  });
});
