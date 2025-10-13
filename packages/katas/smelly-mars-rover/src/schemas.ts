import { z } from "zod";
import {
  INSTRUCTION_STRING_REGEX,
  START_POSITION_STRING_REGEX,
} from "./constants.js";

export const HeadingSchema = z.enum(["N", "E", "S", "W"]);
export const CommandSchema = z.enum(["L", "R", "M"]);

export const PositionSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export const RoverSchema = z.object({
  position: PositionSchema,
  heading: HeadingSchema,
});

export const InstructionStringSchema = z
  .string()
  .regex(INSTRUCTION_STRING_REGEX);
export const StartPositionStringSchema = z
  .string()
  .regex(START_POSITION_STRING_REGEX);

export const StartPositionStringWithTransformSchema =
  StartPositionStringSchema.transform((str) => {
    const parts = str.split(" ");
    const x = Number.parseInt(parts[0] ?? "0", 10);
    const y = Number.parseInt(parts[1] ?? "0", 10);
    const direction = HeadingSchema.parse(parts[2]);
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
