import {describe, expect, test} from "vitest";
import {resultIsSuccess} from "@ns-dojo/shared-core";
import {BoardBuilder} from "./board-builder.js";
import {CellState} from "../constants.js";
import {getCell} from "../board-core.js";

describe("BoardBuilderShould", () => {
  test("create empty board", () => {
    const board = BoardBuilder.empty().build();

    expect(board.cells.length).toBe(6);
    expect(board.cells[0]?.length).toBe(7);
    const allEmpty = board.cells.flat().every((cell) => cell === CellState.Empty);
    expect(allEmpty).toBe(true);
  });

  test("place coin at specified position", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 3}, CellState.Player1)
      .build();

    const cellResult = getCell(board, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult)).toBe(true);
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("place multiple coins", () => {
    const board = BoardBuilder.empty()
      .withCoin({row: 1, column: 1}, CellState.Player1)
      .withCoin({row: 1, column: 2}, CellState.Player2)
      .build();

    const cell1 = getCell(board, {row: 1, column: 1});
    const cell2 = getCell(board, {row: 1, column: 2});

    expect(resultIsSuccess(cell1)).toBe(true);
    expect(resultIsSuccess(cell2)).toBe(true);
    expect(resultIsSuccess(cell1) && cell1.value).toBe(CellState.Player1);
    expect(resultIsSuccess(cell2) && cell2.value).toBe(CellState.Player2);
  });
});
