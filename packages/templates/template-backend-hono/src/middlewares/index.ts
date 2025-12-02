/**
 * Middleware stack for the Hono application
 *
 * Order matters! Middleware is applied in the order listed here.
 * See the blueprint for the recommended order:
 *
 * 1. CORS (must be early for preflight requests)
 * 2. Secure headers (baseline OWASP headers)
 * 3. Request ID & logging (for tracing)
 * 4. Body limit (protect against large payloads)
 * 5. Compression (reduce bandwidth)
 * 6. ETag (conditional requests)
 * 7. JWT (authentication, per-route or global)
 */

export {bodyLimitMiddleware} from "./body-limit.js";
export {compressionMiddleware} from "./compression.js";
export {corsMiddleware} from "./cors.js";
export {etagMiddleware} from "./etag.js";
export {jwtMiddleware} from "./jwt.js";
export {loggingStack, requestIdMiddleware} from "./logging.js";
export {secureHeadersMiddleware} from "./secure-headers.js";
