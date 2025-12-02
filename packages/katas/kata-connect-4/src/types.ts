import type {z} from "zod";
import type {BoardSchema, PositionSchema} from "./schemas.js";

export type Board = z.infer<typeof BoardSchema>;
export type Position = z.infer<typeof PositionSchema>;
