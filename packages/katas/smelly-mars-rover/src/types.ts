import type { z } from "zod";

import type {
  HeadingSchema,
  CommandSchema,
  StartPositionStringSchema,
  InstructionStringSchema,
  Vector2DSchema,
} from "./schemas.js";

export type Heading = z.infer<typeof HeadingSchema>;
export type Command = z.infer<typeof CommandSchema>;

export type StartPositionString = z.infer<typeof StartPositionStringSchema>;
export type InstructionString = z.infer<typeof InstructionStringSchema>;

export type Vector2D = z.infer<typeof Vector2DSchema>;
