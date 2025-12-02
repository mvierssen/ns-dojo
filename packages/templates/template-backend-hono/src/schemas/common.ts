import {z} from "@hono/zod-openapi";
import type {
  PaginationSchema as BasePaginationSchema,
  ProblemDetailsSchema as BaseProblemDetailsSchema,
  SuccessResponseSchema as BaseSuccessResponseSchema,
} from "@ns-dojo/shared-hono";

/**
 * Common schemas used across the application with OpenAPI metadata
 *
 * These schemas extend the base schemas from shared-hono with OpenAPI annotations
 */

/**
 * Standard error response (RFC 7807 Problem Details)
 */
export const ProblemDetailsSchema = z
  .object({
    type: z.string().openapi({
      description: "URI reference identifying the problem type",
      example: "https://api.example.com/errors/validation-error",
    }),
    title: z.string().openapi({
      description: "Short, human-readable summary of the problem",
      example: "Validation Error",
    }),
    status: z.number().int().openapi({
      description: "HTTP status code",
      example: 400,
    }),
    detail: z.string().optional().openapi({
      description: "Human-readable explanation specific to this occurrence",
      example: "The name field is required",
    }),
    instance: z.string().optional().openapi({
      description: "URI reference identifying this specific occurrence",
      example: "/v1/items",
    }),
    issues: z
      .array(
        z
          .object({
            path: z.array(z.string()).openapi({
              description: "Path to the field that caused the error",
              example: ["name"],
            }),
            message: z.string().openapi({
              description: "Error message for this field",
              example: "Name is required",
            }),
            code: z.string().optional().openapi({
              description: "Error code for this issue",
              example: "invalid_type",
            }),
          })
          .openapi("ValidationIssue"),
      )
      .optional()
      .openapi({
        description: "Array of field-level validation errors",
      }),
  })
  .openapi("ProblemDetails", {
    description: "RFC 7807 Problem Details for HTTP APIs",
  });

export type ProblemDetails = z.infer<typeof BaseProblemDetailsSchema>;

/**
 * Pagination metadata
 */
export const PaginationSchema = z
  .object({
    page: z.number().int().min(1).openapi({
      description: "Current page number",
      example: 1,
    }),
    limit: z.number().int().min(1).max(100).openapi({
      description: "Items per page",
      example: 10,
    }),
    total: z.number().int().min(0).openapi({
      description: "Total number of items",
      example: 42,
    }),
    totalPages: z.number().int().min(0).openapi({
      description: "Total number of pages",
      example: 5,
    }),
  })
  .openapi("Pagination");

export type Pagination = z.infer<typeof BasePaginationSchema>;

/**
 * Simple success response
 */
export const SuccessResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Operation success status",
      example: true,
    }),
    message: z.string().optional().openapi({
      description: "Optional success message",
      example: "Item deleted successfully",
    }),
  })
  .openapi("SuccessResponse");

export type SuccessResponse = z.infer<typeof BaseSuccessResponseSchema>;
