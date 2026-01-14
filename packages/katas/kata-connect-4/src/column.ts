import {resultCreateSuccess, resultCreateFailure, type Result} from "@ns-dojo/shared-core";
import {BOARD_COLUMNS} from "./constants.js";
import type {Column} from "./types.js";

export function validateColumn(value: number): Result<Column> {
  if (value < 1 || value > BOARD_COLUMNS) {
    return resultCreateFailure(
      `Column must be between 1 and ${String(BOARD_COLUMNS)}`
    );
  }
  return resultCreateSuccess(value as Column);
}
