import {createModuleLogger} from "@ns-dojo/shared-logging";
import type {Context} from "hono";

const logger = createModuleLogger("health");

/**
 * Health check function that returns a boolean indicating health status
 */
export interface HealthCheck {
  /**
   * Name of the health check (e.g., "database", "redis", "s3")
   */
  name: string;

  /**
   * Function that performs the health check
   * Should return true if healthy, false if unhealthy
   * Should throw an error if the check fails
   */
  check: () => Promise<boolean>;
}

/**
 * Liveness probe handler for Kubernetes
 *
 * Returns 200 OK if the service is alive (process is running).
 * This endpoint should always return 200 unless the process is completely broken.
 *
 * @param c - Hono context
 * @returns Response with status 200 and "OK"
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono';
 * import { livenessHandler } from '@ns-dojo/shared-hono';
 *
 * const app = new Hono();
 * app.get('/health/liveness', livenessHandler);
 * ```
 */
export function livenessHandler(c: Context): Response {
  return c.text("OK", 200);
}

/**
 * Readiness probe handler for Kubernetes
 *
 * Returns 200 OK if the service is ready to accept traffic (all dependencies are healthy).
 * Returns 503 Service Unavailable if any dependency check fails.
 *
 * @param checks - Array of health checks to run
 * @returns Handler function
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono';
 * import { readinessHandler } from '@ns-dojo/shared-hono';
 * import { pool } from './database';
 *
 * const app = new Hono();
 *
 * app.get('/health/readiness', readinessHandler([
 *   {
 *     name: 'database',
 *     check: async () => {
 *       const result = await pool.query('SELECT 1');
 *       return result.rows.length > 0;
 *     }
 *   },
 *   {
 *     name: 'redis',
 *     check: async () => {
 *       await redis.ping();
 *       return true;
 *     }
 *   }
 * ]));
 * ```
 */
export function readinessHandler(
  checks: HealthCheck[] = [],
): (c: Context) => Promise<Response> {
  return async (c: Context): Promise<Response> => {
    // If no checks provided, always ready
    if (checks.length === 0) {
      return c.json({status: "ready", checks: []}, 200);
    }

    const results: {name: string; healthy: boolean; error?: string}[] = [];
    let allHealthy = true;

    // Run all health checks
    for (const healthCheck of checks) {
      try {
        const healthy = await healthCheck.check();
        results.push({
          name: healthCheck.name,
          healthy,
        });

        if (!healthy) {
          allHealthy = false;
          logger.warn(`Health check failed: ${healthCheck.name}`);
        }
      } catch (error) {
        allHealthy = false;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          name: healthCheck.name,
          healthy: false,
          error: errorMessage,
        });
        logger.error(`Health check error: ${healthCheck.name}`, {error});
      }
    }

    if (allHealthy) {
      return c.json(
        {
          status: "ready",
          checks: results,
        },
        200,
      );
    }

    return c.json(
      {
        status: "not_ready",
        checks: results,
      },
      503,
    );
  };
}
