import type {CellState} from "./constants.js";
import type {Position} from "./types.js";

export interface BoardInterface {
  getCell(position: Position): CellState;
  getAvailableColumns(): number[];
  getCells(): readonly (readonly CellState[])[];
}
