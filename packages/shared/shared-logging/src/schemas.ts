import {z} from "zod";

export const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);

export const LoggerConfigSchema = z.object({
  prefix: z.string().optional(),
  level: LogLevelSchema.optional(),
  timestamp: z.boolean().optional(),
});
