import {
  resultCreateFailure,
  resultCreateSuccess,
  type Result,
} from "@ns-dojo/shared-core";
import {BOARD_COLUMNS} from "./constants.js";
import {ColumnInputSchema} from "./schemas.js";

export function parseColumnInput(input: string): Result<number> {
  const trimmed = input.trim();
  const parsed = Number(trimmed);

  if (Number.isNaN(parsed)) {
    return resultCreateFailure("Invalid column input: not a number");
  }

  const validation = ColumnInputSchema.safeParse(parsed);

  if (validation.success) {
    return resultCreateSuccess(validation.data);
  }

  if (parsed < 1 || parsed > BOARD_COLUMNS) {
    return resultCreateFailure(`Column must be between 1 and ${String(BOARD_COLUMNS)}`);
  }

  return resultCreateFailure("Invalid column input");
}
