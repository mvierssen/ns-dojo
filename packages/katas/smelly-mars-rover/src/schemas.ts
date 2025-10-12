import { z } from "zod";

export const HeadingSchema = z.enum(["N", "E", "S", "W"]);
export const CommandSchema = z.enum(["L", "R", "M"]);
