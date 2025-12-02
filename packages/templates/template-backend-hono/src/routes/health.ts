import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {defaultHook} from "../openapi/config.js";
import {ProblemDetailsSchema} from "../schemas/common.js";

/**
 * Health check router
 *
 * Kubernetes-ready health endpoints:
 * - /healthz: Liveness probe (is the app running?)
 * - /readyz: Readiness probe (can the app serve traffic?)
 *
 * Liveness vs Readiness:
 * - Liveness: If this fails, Kubernetes will restart the pod
 * - Readiness: If this fails, Kubernetes will stop sending traffic
 *
 * Use readiness checks for:
 * - Database connectivity
 * - Dependency service health
 * - Graceful shutdown (mark as not ready during shutdown)
 */

export const healthRouter = new OpenAPIHono({defaultHook});

/**
 * Liveness probe
 * Returns 200 if the application is running
 */
const healthCheckRoute = createRoute({
  method: "get",
  path: "/healthz",
  tags: ["Health"],
  summary: "Health check",
  description: "Basic health check endpoint for monitoring",
  operationId: "healthCheck",
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: z
            .object({
              status: z.string().openapi({
                description: "Health status",
                example: "ok",
              }),
              timestamp: z.iso.datetime().openapi({
                description: "Current server timestamp",
                example: "2025-11-08T12:00:00Z",
              }),
            })
            .openapi("HealthCheckResponse"),
        },
      },
    },
  },
});

healthRouter.openapi(healthCheckRoute, (c) => {
  return c.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});

/**
 * Readiness probe
 * Returns 200 if the application is ready to serve traffic
 *
 * In production, add checks for:
 * - Database connection
 * - External dependencies
 * - Critical resources
 *
 * Example:
 * ```ts
 * healthRouter.openapi(readinessCheckRoute, async (c) => {
 *   try {
 *     // Check database
 *     await db.query('SELECT 1');
 *
 *     // Check shutdown flag
 *     if (isShuttingDown) {
 *       return c.json({ status: 'shutting_down' }, 503);
 *     }
 *
 *     return c.json({ status: 'ready' });
 *   } catch (error) {
 *     return c.json({ status: 'not_ready', error: error.message }, 503);
 *   }
 * });
 * ```
 */
const readinessCheckRoute = createRoute({
  method: "get",
  path: "/readyz",
  tags: ["Health"],
  summary: "Readiness check",
  description: "Kubernetes readiness probe endpoint",
  operationId: "readinessCheck",
  responses: {
    200: {
      description: "Service is ready to accept traffic",
      content: {
        "application/json": {
          schema: z
            .object({
              status: z.string().openapi({
                description: "Readiness status",
                example: "ready",
              }),
              timestamp: z.iso.datetime().openapi({
                description: "Current server timestamp",
                example: "2025-11-08T12:00:00Z",
              }),
              checks: z
                .object({
                  database: z.string().optional().openapi({
                    description: "Database connectivity status",
                    example: "ok",
                  }),
                  redis: z.string().optional().openapi({
                    description: "Redis connectivity status",
                    example: "ok",
                  }),
                })
                .optional()
                .openapi({
                  description: "Optional dependency health checks",
                }),
            })
            .openapi("ReadinessCheckResponse"),
        },
      },
    },
    503: {
      description: "Service not ready",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

healthRouter.openapi(readinessCheckRoute, (c) => {
  // TODO: Add dependency health checks here

  return c.json(
    {
      status: "ready",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});
