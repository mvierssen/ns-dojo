import { z } from "zod";

import { BOARD_COLUMNS, BOARD_ROWS, CellState } from "./constants.js";

export const CellStateSchema = z.enum(CellState);

export const BoardSchema = z.object({
  cells: z.array(z.array(CellStateSchema).length(BOARD_COLUMNS)).length(BOARD_ROWS),
});
