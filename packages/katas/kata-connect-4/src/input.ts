import {resultCreateFailure, type Result} from "@ns-dojo/shared-core";
import {validateColumn} from "./column.js";
import type {Column} from "./types.js";

export function parseColumnInput(input: string): Result<Column> {
  const trimmed = input.trim();
  const parsed = Number(trimmed);

  if (Number.isNaN(parsed)) {
    return resultCreateFailure("Invalid column input: not a number");
  }

  return validateColumn(parsed);
}
