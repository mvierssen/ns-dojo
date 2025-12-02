import {createCorsMiddleware} from "@ns-dojo/shared-hono";

/**
 * CORS middleware configuration
 *
 * IMPORTANT: This is a permissive configuration for development.
 * In production, you should:
 * - Set specific origins instead of "*"
 * - Restrict allowed methods and headers
 * - Enable credentials only if needed
 * - Set appropriate maxAge for preflight caching
 *
 * Example production config:
 * ```ts
 * const corsMiddleware = createCorsMiddleware({
 *   origin: ['https://app.example.com', 'https://admin.example.com'],
 *   allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
 *   allowHeaders: ['Content-Type', 'Authorization'],
 *   credentials: true,
 *   maxAge: 600, // 10 minutes
 * });
 * ```
 */
export const corsMiddleware = createCorsMiddleware({
  origin: "*", // Allow all origins (dev only!)
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "X-Request-ID"],
  exposeHeaders: ["X-Request-ID"],
  credentials: false,
  maxAge: 86_400, // 24 hours
});
