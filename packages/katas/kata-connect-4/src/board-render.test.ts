import {describe, expect, test} from "vitest";
import {createBoard} from "./board-core.js";
import {renderRow, renderBoardWithLabels} from "./board-render.js";
import {CellState, COLUMN_LABELS_STRING} from "./constants.js";

describe("BoardRenderShould", () => {
  test("render single row of empty cells", () => {
    const row: CellState[] = Array.from({length: 7}, () => CellState.Empty);
    const rendered = renderRow(row);
    expect(rendered).toBe("⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪");
  });

  test("render board with column labels at bottom", () => {
    const board = createBoard();
    const rendered = renderBoardWithLabels(board);
    const lines = rendered.split("\n");
    expect(lines.at(-1)).toBe(COLUMN_LABELS_STRING);
  });
});
