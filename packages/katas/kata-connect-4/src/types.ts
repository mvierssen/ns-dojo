import type {Result} from "@ns-dojo/shared-core";
import type {z} from "zod";
import type {CellState} from "./constants.js";
import type {GameInstructions} from "./instructions.js";
import type {BoardSchema, PositionSchema} from "./schemas.js";

export type Board = z.infer<typeof BoardSchema>;
export type Position = z.infer<typeof PositionSchema>;

export type Column = number & {readonly __brand: "Column"};

export interface IGame {
  start(): void;
  getBoard(): Board;
  getInstructions(): GameInstructions;
  displayBoard(): string;
  validateColumnInput(input: string): Result<Column>;
  dropCoin(column: Column, player: CellState): Result<Position>;
}
