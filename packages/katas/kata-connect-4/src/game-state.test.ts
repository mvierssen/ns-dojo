import {describe, expect, test} from "vitest";
import type {GameState} from "./game-state.js";
import {initializeGameState} from "./game-state.js";
import {createBoard} from "./board-core.js";

describe("GameStateShould", () => {
  test("have board property", () => {
    const board = createBoard();
    const gameState: GameState = {
      board,
    };

    expect(gameState.board).toBe(board);
  });

  test("initialize with empty board", () => {
    const gameState = initializeGameState();

    expect(gameState.board).toBeDefined();
    expect(gameState.board.cells.length).toBe(6);
  });
});
