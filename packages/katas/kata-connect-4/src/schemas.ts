import { z } from "zod";

import { BOARD_ROWS } from "./constants.js";

export const CellStateSchema = z.string();

export const BoardSchema = z.object({
  cells: z.array(z.array(CellStateSchema)).length(BOARD_ROWS),
});
