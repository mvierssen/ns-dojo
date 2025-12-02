import {z} from "zod";

export const CsrfConfigSchema = z.object({
  secret: z.string().min(1),
  tokenLength: z.number().int().positive(),
});

export const ParsedTokenSchema = z.object({
  hmac: z.string().min(1),
  randomValue: z.string().min(1),
});

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  error: z.string().optional(),
});

export const CsrfTokenResponseSchema = z.object({
  csrfToken: z.string().min(1),
});
