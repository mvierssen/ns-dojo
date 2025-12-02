import {createEtagMiddleware} from "@ns-dojo/shared-hono";

/**
 * ETag middleware for conditional requests
 *
 * Generates ETags for responses and handles If-None-Match headers
 * Returns 304 Not Modified when content hasn't changed
 *
 * Benefits:
 * - Reduces bandwidth (client can reuse cached content)
 * - Improves performance (server can skip generating unchanged responses)
 * - Enables conditional updates (optimistic locking)
 *
 * Works with:
 * - GET requests (If-None-Match → 304 Not Modified)
 * - PUT/PATCH requests (If-Match → 412 Precondition Failed if stale)
 *
 * Hono generates weak ETags by default (W/"...").
 */
export const etagMiddleware = createEtagMiddleware();
