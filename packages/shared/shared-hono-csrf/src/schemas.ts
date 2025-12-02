import {z} from "zod";

/**
 * Schema for CSRF token response
 */
export const CsrfTokenResponseSchema = z.object({
  csrfToken: z.string().min(1),
});

export type CsrfTokenResponse = z.infer<typeof CsrfTokenResponseSchema>;
