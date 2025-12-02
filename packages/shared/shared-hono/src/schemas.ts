import {z} from "zod";

/**
 * Common Zod schemas for OpenAPI integration
 *
 * These schemas can be used with @hono/zod-openapi by calling .openapi() on them
 */

/**
 * Standard error response (RFC 7807 Problem Details)
 *
 * @example
 * ```ts
 * import { z } from '@hono/zod-openapi';
 * const schema = ProblemDetailsSchema.openapi('ProblemDetails', {
 *   description: 'RFC 7807 Problem Details for HTTP APIs'
 * });
 * ```
 */
export const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  issues: z
    .array(
      z.object({
        path: z.array(z.string()),
        message: z.string(),
        code: z.string().optional(),
      }),
    )
    .optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

/**
 * Pagination metadata
 *
 * @example
 * ```ts
 * import { z } from '@hono/zod-openapi';
 * const schema = PaginationSchema.openapi('Pagination');
 * ```
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Simple success response
 *
 * @example
 * ```ts
 * import { z } from '@hono/zod-openapi';
 * const schema = SuccessResponseSchema.openapi('SuccessResponse');
 * ```
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
