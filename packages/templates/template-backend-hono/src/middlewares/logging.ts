import {
  createLoggingStack,
  createRequestIdMiddleware,
} from "@ns-dojo/shared-hono";

/**
 * Request ID middleware
 * Generates or extracts a unique ID for each request
 * Useful for distributed tracing and log correlation
 */
export const requestIdMiddleware = createRequestIdMiddleware({
  headerName: "X-Request-ID",
  generate: () => crypto.randomUUID(),
});

/**
 * Request logging middleware
 *
 * Logs all incoming requests with:
 * - HTTP method
 * - Path
 * - Status code
 * - Response time
 *
 * Production: Replace with structured logging
 * ```ts
 * import { yourLogger } from '@ns-dojo/shared-logging';
 *
 * export const loggingMiddleware: MiddlewareHandler = async (c, next) => {
 *   const start = Date.now();
 *   const requestId = c.get('requestId');
 *
 *   await next();
 *
 *   const duration = Date.now() - start;
 *   yourLogger.info('request', {
 *     requestId,
 *     method: c.req.method,
 *     path: c.req.path,
 *     status: c.res.status,
 *     duration,
 *   });
 * };
 * ```
 */

/**
 * Combined logging setup: request ID + logging
 */
export const loggingStack = createLoggingStack({
  requestIdOptions: {
    headerName: "X-Request-ID",
    generate: () => crypto.randomUUID(),
  },
});
