import {describe, expect, test} from "vitest";
import {BoardBuilder} from "./board-builder.js";
import {CellState} from "../constants.js";

describe("BoardBuilderShould", () => {
  test("create empty board", () => {
    const board = BoardBuilder.empty().build();

    expect(board.cells.length).toBe(6);
    expect(board.cells[0]?.length).toBe(7);
    const allEmpty = board.cells.flat().every((cell) => cell === CellState.Empty);
    expect(allEmpty).toBe(true);
  });
});
