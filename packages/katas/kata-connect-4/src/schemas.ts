import {z} from "zod";
import {BOARD_COLUMNS, BOARD_ROWS, CellState} from "./constants.js";

export const CellStateSchema = z.enum(CellState);

export const PositionSchema = z.object({
  row: z.number().int().min(1).max(BOARD_ROWS),
  column: z.number().int().min(1).max(BOARD_COLUMNS),
});

export const BoardSchema = z.object({
  cells: z
    .array(z.array(CellStateSchema).length(BOARD_COLUMNS))
    .length(BOARD_ROWS),
});

export const ColumnInputSchema = z.number().int().min(1).max(BOARD_COLUMNS);
