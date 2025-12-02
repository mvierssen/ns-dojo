import type {z} from "zod";
import type {
  InstructionStringSchema,
  PositionDirectionStringSchema,
  RoverStateSchema,
  Vector2DSchema,
} from "./schemas.js";

export type RoverState = z.infer<typeof RoverStateSchema>;

export type PositionDirectionString = z.infer<
  typeof PositionDirectionStringSchema
>;
export type InstructionString = z.infer<typeof InstructionStringSchema>;

export type Vector2D = z.infer<typeof Vector2DSchema>;
