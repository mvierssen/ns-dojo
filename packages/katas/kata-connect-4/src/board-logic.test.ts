import {describe, expect, test} from "vitest";
import {resultIsSuccess} from "@ns-dojo/shared-core";
import {createBoard, getCell} from "./board-core.js";
import {dropCoin, findLowestEmptyRow} from "./board-logic.js";
import {CellState} from "./constants.js";

describe("BoardLogicShould", () => {
  test("findLowestEmptyRow returns row 1 for empty column", () => {
    const board = createBoard();
    const lowestRow = findLowestEmptyRow(board, 3);
    expect(lowestRow).toBe(1);
  });

  test("dropCoin places coin at row 1 in empty column", () => {
    const board = createBoard();
    const result = dropCoin(board, 3, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value.position.row).toBe(1);

    const newBoard = resultIsSuccess(result) ? result.value.board : board;
    const cellResult = getCell(newBoard, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });
});
