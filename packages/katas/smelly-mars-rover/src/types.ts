import type { z } from "zod";

import type {
  DirectionSchema,
  CommandSchema,
  PositionDirectionStringSchema,
  InstructionStringSchema,
  Vector2DSchema,
} from "./schemas.js";

export type Heading = z.infer<typeof DirectionSchema>;
export type Command = z.infer<typeof CommandSchema>;

export type PositionDirectionString = z.infer<
  typeof PositionDirectionStringSchema
>;
export type InstructionString = z.infer<typeof InstructionStringSchema>;

export type Vector2D = z.infer<typeof Vector2DSchema>;
