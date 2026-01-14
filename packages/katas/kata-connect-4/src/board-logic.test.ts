import {describe, expect, test} from "vitest";
import {resultIsSuccess} from "@ns-dojo/shared-core";
import {createBoard, getCell} from "./board-core.js";
import {dropCoin, findLowestEmptyRow} from "./board-logic.js";
import {validateColumn} from "./column.js";
import {CellState} from "./constants.js";

describe("BoardLogicShould", () => {
  test("findLowestEmptyRow returns row 1 for empty column", () => {
    const board = createBoard();
    const columnResult = validateColumn(3);
    expect(resultIsSuccess(columnResult)).toBe(true);
    const lowestRow = resultIsSuccess(columnResult) ? findLowestEmptyRow(board, columnResult.value) : null;
    expect(lowestRow).toBe(1);
  });

  test("dropCoin places coin at row 1 in empty column", () => {
    const board = createBoard();
    const columnResult = validateColumn(3);
    expect(resultIsSuccess(columnResult)).toBe(true);
    if (!resultIsSuccess(columnResult)) return;
    const result = dropCoin(board, columnResult.value, CellState.Player1);

    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value.position.row).toBe(1);

    const newBoard = resultIsSuccess(result) ? result.value.board : board;
    const cellResult = getCell(newBoard, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("dropCoin accepts Column branded type", () => {
    const board = createBoard();
    const columnResult = validateColumn(3);

    expect(resultIsSuccess(columnResult)).toBe(true);
    if (!resultIsSuccess(columnResult)) return;
    const result = dropCoin(board, columnResult.value, CellState.Player1);
    expect(resultIsSuccess(result)).toBe(true);
  });
});
