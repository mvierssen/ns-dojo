import {describe, expect, test} from "vitest";
import type {GameState} from "./game-state.js";
import {createBoard} from "./board-core.js";

describe("GameStateShould", () => {
  test("have board property", () => {
    const board = createBoard();
    const gameState: GameState = {
      board,
    };

    expect(gameState.board).toBe(board);
  });
});
