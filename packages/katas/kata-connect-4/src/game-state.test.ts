import {resultIsFailure, resultIsSuccess} from "@ns-dojo/shared-core";
import {describe, expect, test} from "vitest";
import {createBoard} from "./board-core.js";
import {validateColumn} from "./column.js";
import {CellState} from "./constants.js";
import {
  initializeGameState,
  processMove,
  type GameState,
} from "./game-state.js";

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

  test("process move and return new game state", () => {
    const gameState = initializeGameState();
    const col = validateColumn(3);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    const result = processMove(gameState, col.value, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value.gameState).toBeDefined();
    expect(resultIsSuccess(result) && result.value.gameState.board).not.toBe(
      gameState.board,
    );
  });

  test("return failure when column is full", () => {
    const gameState = initializeGameState();
    const col = validateColumn(1);
    expect(resultIsSuccess(col)).toBe(true);
    if (!resultIsSuccess(col)) return;
    let currentState = gameState;
    for (let i = 0; i < 6; i++) {
      const result = processMove(currentState, col.value, CellState.Player1);
      if (resultIsSuccess(result)) {
        currentState = result.value.gameState;
      }
    }

    const result = processMove(currentState, col.value, CellState.Player2);
    expect(resultIsFailure(result)).toBe(true);
  });
});
