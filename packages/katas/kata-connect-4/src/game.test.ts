import { describe, expect, test } from "vitest";

import { Game } from "./game.js";
import { CellState } from "./constants.js";

describe("GameShould", () => {
  test("begin with a fresh board when started", () => {
    const game = new Game();
    game.start();
    const board = game.getBoard();
    const allEmpty = board.cells.flat().every((c) => c === CellState.Empty);
    expect(allEmpty).toBe(true);
  });
});
