import {describe, expect, test} from "vitest";
import {checkHorizontalWin} from "./win-detection.js";
import {BoardBuilder} from "./test-utils/board-builder.js";
import {CellState} from "./constants.js";

describe("WinDetectionShould", () => {
  test("detect horizontal win with 4 in row", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player1)
      .withCoin({row: 1, column: 3}, CellState.Player1)
      .withCoin({row: 1, column: 4}, CellState.Player1)
      .build();

    const result = checkHorizontalWin(board, {row: 1, column: 4}, CellState.Player1);
    expect(result).toBe(true);
  });

  test("detect horizontal win starting from middle position", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 2, column: 2}, CellState.Player2)
      .withCoin({row: 2, column: 3}, CellState.Player2)
      .withCoin({row: 2, column: 4}, CellState.Player2)
      .withCoin({row: 2, column: 5}, CellState.Player2)
      .build();

    const result = checkHorizontalWin(board, {row: 2, column: 3}, CellState.Player2);
    expect(result).toBe(true);
  });
});
