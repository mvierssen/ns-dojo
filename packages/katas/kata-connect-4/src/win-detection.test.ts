import {describe, expect, test} from "vitest";
import {checkDiagonalWin, checkHorizontalWin, checkVerticalWin, checkWin} from "./win-detection.js";
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

  test("return false when only 3 in horizontal row", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player1)
      .withCoin({row: 1, column: 3}, CellState.Player1)
      .build();

    const result = checkHorizontalWin(board, {row: 1, column: 3}, CellState.Player1);
    expect(result).toBe(false);
  });

  test("return false when 4 cells interrupted", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player1)
      .withCoin({row: 1, column: 3}, CellState.Player2)
      .withCoin({row: 1, column: 4}, CellState.Player1)
      .build();

    const result = checkHorizontalWin(board, {row: 1, column: 2}, CellState.Player1);
    expect(result).toBe(false);
  });

  test("detect vertical win with 4 in column", () => {
    const board = BoardBuilder.empty()
      .withColumn(3, [
        CellState.Player1,
        CellState.Player1,
        CellState.Player1,
        CellState.Player1,
      ])
      .build();

    const result = checkVerticalWin(board, {row: 4, column: 3}, CellState.Player1);
    expect(result).toBe(true);
  });

  test("return false when only 3 in vertical column", () => {
    const board = BoardBuilder.empty()
      .withColumn(2, [CellState.Player2, CellState.Player2, CellState.Player2])
      .build();

    const result = checkVerticalWin(board, {row: 3, column: 2}, CellState.Player2);
    expect(result).toBe(false);
  });

  test("detect diagonal win down-right", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 3, column: 1}, CellState.Player1)
      .withCoin({row: 4, column: 2}, CellState.Player1)
      .withCoin({row: 5, column: 3}, CellState.Player1)
      .withCoin({row: 6, column: 4}, CellState.Player1)
      .build();

    const result = checkDiagonalWin(board, {row: 6, column: 4}, CellState.Player1);
    expect(result).toBe(true);
  });

  test("detect diagonal win down-left", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 3, column: 7}, CellState.Player2)
      .withCoin({row: 4, column: 6}, CellState.Player2)
      .withCoin({row: 5, column: 5}, CellState.Player2)
      .withCoin({row: 6, column: 4}, CellState.Player2)
      .build();

    const result = checkDiagonalWin(board, {row: 5, column: 5}, CellState.Player2);
    expect(result).toBe(true);
  });

  test("checkWin detects horizontal win", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player1)
      .withCoin({row: 1, column: 3}, CellState.Player1)
      .withCoin({row: 1, column: 4}, CellState.Player1)
      .build();

    const result = checkWin(board, {row: 1, column: 4}, CellState.Player1);
    expect(result).toBe(true);
  });

  test("checkWin detects vertical win", () => {
    const board = BoardBuilder.empty()
      .withColumn(5, [
        CellState.Player2,
        CellState.Player2,
        CellState.Player2,
        CellState.Player2,
      ])
      .build();

    const result = checkWin(board, {row: 4, column: 5}, CellState.Player2);
    expect(result).toBe(true);
  });

  test("checkWin handles corner position win", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player1)
      .withCoin({row: 1, column: 3}, CellState.Player1)
      .withCoin({row: 1, column: 4}, CellState.Player1)
      .build();

    const result = checkWin(board, {row: 1, column: 1}, CellState.Player1);
    expect(result).toBe(true);
  });

  test("checkWin returns false for no win at edge", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 7}, CellState.Player2)
      .build();

    const result = checkWin(board, {row: 1, column: 7}, CellState.Player2);
    expect(result).toBe(false);
  });
});
