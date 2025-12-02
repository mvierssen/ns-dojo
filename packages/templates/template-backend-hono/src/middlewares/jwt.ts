import {createJwtMiddleware} from "@ns-dojo/shared-hono/jwt";

/**
 * JWT authentication middleware
 *
 * Validates Bearer tokens and attaches JWT payload to context
 *
 * Usage:
 * ```ts
 * // Protect a route
 * app.get('/api/v1/protected', ...jwtMiddleware, async (c) => {
 *   const userId = getUserId(c);
 *   return c.json({ userId });
 * });
 *
 * // Protect all routes under /api
 * app.use('/api/*', ...jwtMiddleware);
 * ```
 *
 * Environment:
 * Set JWT_SECRET environment variable in production
 * For development, using a default secret (NOT FOR PRODUCTION!)
 */
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

if (JWT_SECRET === "dev-secret-change-in-production") {
  console.warn(
    "⚠️  WARNING: Using default JWT secret. Set JWT_SECRET environment variable in production!",
  );
}

/**
 * JWT middleware array
 * Includes both JWT validation and user attachment
 */
export const jwtMiddleware = createJwtMiddleware(JWT_SECRET);
