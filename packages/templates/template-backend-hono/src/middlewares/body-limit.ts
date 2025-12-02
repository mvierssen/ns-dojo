import {createBodyLimitMiddleware} from "@ns-dojo/shared-hono";

/**
 * Body size limit middleware
 *
 * Protects against large uploads and JSON payloads that could:
 * - Exhaust memory
 * - Cause DoS
 * - Slow down request processing
 *
 * Default: 10 MB (suitable for most API requests)
 *
 * Per-route overrides:
 * ```ts
 * app.post('/upload',
 *   createBodyLimitMiddleware({ maxSize: 50 * 1024 * 1024 }), // 50 MB for file uploads
 *   async (c) => { ... }
 * );
 * ```
 */
export const bodyLimitMiddleware = createBodyLimitMiddleware({
  maxSize: 10 * 1024 * 1024, // 10 MB
});
