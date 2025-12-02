import { describe, expect, test } from "vitest";

import { createBoard } from "./board.js";

describe("BoardShould", () => {
  test("have 6 rows", () => {
    const board = createBoard();
    expect(board.cells.length).toBe(6);
  });

  test("have 7 columns per row", () => {
    const board = createBoard();
    expect(board.cells[0]?.length).toBe(7);
  });
});
