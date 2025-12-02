import type {z} from "zod";
import type {JwtConfigSchema} from "./schemas.js";

export type JwtConfig = z.infer<typeof JwtConfigSchema>;

export type JwtPayload<TRole extends string = string> = {
  user_id: string;
  role: TRole;
} & Record<string, unknown>;
