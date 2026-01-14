import {describe, expect, test} from "vitest";
import {resultIsSuccess} from "@ns-dojo/shared-core";
import {createBoard, getCell} from "./board-core.js";
import {CellState} from "./constants.js";

describe("BoardCoreShould", () => {
  test("create board with 6 rows", () => {
    const board = createBoard();
    expect(board.cells.length).toBe(6);
  });

  test("create board with 7 columns per row", () => {
    const board = createBoard();
    expect(board.cells[0]?.length).toBe(7);
  });

  test("getCell returns success for valid position", () => {
    const board = createBoard();
    const result = getCell(board, {row: 1, column: 1});

    expect(resultIsSuccess(result)).toBe(true);
    expect(resultIsSuccess(result) && result.value).toBe(CellState.Empty);
  });
});
