import type {z} from "zod";
import type {
  CsrfConfigSchema,
  CsrfTokenResponseSchema,
  ParsedTokenSchema,
  ValidationResultSchema,
} from "./schemas.js";

export type CsrfConfig = z.infer<typeof CsrfConfigSchema>;

export type ParsedToken = z.infer<typeof ParsedTokenSchema>;

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export type CsrfTokenResponse = z.infer<typeof CsrfTokenResponseSchema>;
