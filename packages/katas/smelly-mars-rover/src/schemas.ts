import { z } from "zod";
import {
  INSTRUCTION_STRING_REGEX,
  POSITION_DIRECTION_STRING_REGEX,
} from "./constants.js";

export const DirectionSchema = z.enum(["N", "E", "S", "W"]);
export const CommandSchema = z.enum(["L", "R", "M"]);

export const PositionSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export const RoverSchema = z.object({
  position: PositionSchema,
  direction: DirectionSchema,
});

export const InstructionStringSchema = z
  .string()
  .regex(INSTRUCTION_STRING_REGEX);
export const PositionDirectionStringSchema = z
  .string()
  .regex(POSITION_DIRECTION_STRING_REGEX);

export const PositionDirectionStringWithTransformSchema =
  PositionDirectionStringSchema.transform((str) => {
    const parts = str.split(" ");
    const x = Number.parseInt(parts[0] ?? "0", 10);
    const y = Number.parseInt(parts[1] ?? "0", 10);
    const direction = DirectionSchema.parse(parts[2]);
    return { x, y, direction };
  });

export const InstructionStringWithTransformSchema =
  InstructionStringSchema.transform(
    (str) => str.split("") as z.infer<typeof CommandSchema>[]
  );

export const Vector2DSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});
