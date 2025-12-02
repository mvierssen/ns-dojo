import type {z} from "zod";
import type {LoggerConfigSchema, LogLevelSchema} from "./schemas.js";

export type LogLevel = z.infer<typeof LogLevelSchema>;

export type LoggerConfig = z.infer<typeof LoggerConfigSchema>;
