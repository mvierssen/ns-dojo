import {z} from "zod";

/**
 * Schema for JWT authentication configuration
 */
export const HonoAuthConfigSchema = z.object({
  secret: z.string().min(1, "JWT secret is required"),
  issuer: z.string().optional(),
  audience: z.string().optional(),
});

/**
 * Schema for user payload
 */
export const UserPayloadSchema = z.object({
  id: z.uuid(),
  role: z.string(),
  email: z.email().optional(),
});
