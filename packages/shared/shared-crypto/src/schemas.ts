import {z} from "zod";

export const JwtConfigSchema = z.object({
  secret: z.string().min(1),
  expiresIn: z.string().min(1),
});

export const JwtPayloadSchema = z.object({
  user_id: z.uuid(),
  role: z.string().min(1),
});
