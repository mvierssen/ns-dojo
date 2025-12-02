import {extractAndVerifyToken, JwtError} from "@ns-dojo/shared-crypto";
import {sendProblem, type ProblemDetails} from "@ns-dojo/shared-hono";
import {createModuleLogger} from "@ns-dojo/shared-logging";
import type {Context, MiddlewareHandler} from "hono";
import type {
  AuthVariables,
  HonoAuthConfig,
  OptionalAuthVariables,
  UserPayload,
} from "./types.js";

const logger = createModuleLogger("shared-hono-auth");

/**
 * Get JWT secret from config or environment
 */
function getJwtSecret(config?: HonoAuthConfig): string {
  const secret = config?.secret ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return secret;
}

/**
 * Convert JWT payload to UserPayload format
 */
function convertPayload<TRole extends string>(
  payload: Record<string, unknown>,
): UserPayload<TRole> {
  const email = typeof payload.email === "string" ? payload.email : undefined;

  return {
    id: String(payload.user_id),
    role: String(payload.role) as TRole,
    email,
    ...payload,
  };
}

/**
 * Create RFC 7807 problem details for authentication errors
 */
function createAuthProblem(
  title: string,
  status: number,
  detail?: string,
): ProblemDetails {
  return {
    type: `about:blank#${status === 401 ? "unauthorized" : "forbidden"}`,
    title,
    status,
    detail: detail ?? title,
  };
}

/**
 * Required JWT authentication middleware
 * Validates JWT tokens and attaches user payload to context
 * Returns 401 if token is missing, invalid, or expired
 *
 * @example
 * ```typescript
 * import { authMiddleware } from '@ns-dojo/shared-hono-auth';
 *
 * app.use('/api/*', authMiddleware());
 *
 * app.get('/api/profile', (c) => {
 *   const user = c.get('user');
 *   return c.json({ id: user.id, role: user.role });
 * });
 * ```
 */
export function authMiddleware<TRole extends string = string>(
  config?: HonoAuthConfig,
): MiddlewareHandler<{Variables: AuthVariables<TRole>}> {
  const secret = getJwtSecret(config);

  return async (c, next) => {
    try {
      const authHeader = c.req.header("Authorization");
      const payload = await extractAndVerifyToken<TRole>(authHeader, secret);

      const user = convertPayload<TRole>(payload);
      c.set("user", user);

      logger.info("Authentication successful", {
        userId: user.id,
        role: user.role,
        path: c.req.path,
        method: c.req.method,
      });

      await next();
    } catch (error) {
      if (error instanceof JwtError) {
        logger.warn("JWT error", {
          path: c.req.path,
          method: c.req.method,
          error: error.code,
          message: error.message,
        });
        return sendProblem(
          c,
          createAuthProblem(error.message, error.statusCode, error.code),
        );
      }

      logger.error("Authentication error", {
        path: c.req.path,
        method: c.req.method,
        error: error instanceof Error ? error.message : String(error),
      });

      return sendProblem(c, createAuthProblem("Authentication failed", 500));
    }
  };
}

/**
 * Optional JWT authentication middleware
 * Validates JWT token if present, but allows requests without authentication
 * Sets user in context if valid token provided, continues without error if missing/invalid
 *
 * @example
 * ```typescript
 * import { optionalAuthMiddleware } from '@ns-dojo/shared-hono-auth';
 *
 * app.use('/api/posts/*', optionalAuthMiddleware());
 *
 * app.get('/api/posts/:id', (c) => {
 *   const user = c.get('user'); // May be undefined
 *   if (user) {
 *     // Show personalized content
 *   }
 *   return c.json({ post: {...} });
 * });
 * ```
 */
export function optionalAuthMiddleware<TRole extends string = string>(
  config?: HonoAuthConfig,
): MiddlewareHandler<{Variables: OptionalAuthVariables<TRole>}> {
  const secret = getJwtSecret(config);

  return async (c, next) => {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        logger.debug("Optional auth: No token provided", {
          path: c.req.path,
          method: c.req.method,
        });
        await next();
        return;
      }

      const payload = await extractAndVerifyToken<TRole>(authHeader, secret);
      const user = convertPayload<TRole>(payload);
      c.set("user", user);

      logger.info("Optional auth: Authentication successful", {
        userId: user.id,
        role: user.role,
        path: c.req.path,
        method: c.req.method,
      });

      await next();
    } catch (error) {
      logger.debug("Optional auth: Invalid token, continuing without auth", {
        path: c.req.path,
        method: c.req.method,
        error: error instanceof Error ? error.message : String(error),
      });
      await next();
    }
  };
}

/**
 * Role-based authorization middleware factory
 * Requires user to be authenticated and have one of the specified roles
 * Returns 401 if not authenticated, 403 if insufficient permissions
 *
 * Note: Must be used after authMiddleware()
 *
 * @example
 * ```typescript
 * import { authMiddleware, requireRole } from '@ns-dojo/shared-hono-auth';
 *
 * type UserRole = 'admin' | 'moderator' | 'user';
 *
 * app.use('/api/admin/*', authMiddleware<UserRole>());
 * app.use('/api/admin/*', requireRole<UserRole>('admin', 'moderator'));
 *
 * app.delete('/api/admin/users/:id', (c) => {
 *   // Only admin or moderator can access this
 *   return c.json({ success: true });
 * });
 * ```
 */
export function requireRole<TRole extends string>(
  ...allowedRoles: TRole[]
): MiddlewareHandler<{Variables: AuthVariables<TRole>}> {
  return async (c, next) => {
    const user = c.get("user") as UserPayload<TRole> | undefined;

    if (!user) {
      logger.warn("Authorization failed: No user", {
        path: c.req.path,
        method: c.req.method,
        requiredRoles: allowedRoles,
        error: "AUTH_REQUIRED",
      });
      return sendProblem(
        c,
        createAuthProblem("Authentication required", 401, "AUTH_REQUIRED"),
      );
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn("Authorization failed: Insufficient permissions", {
        path: c.req.path,
        method: c.req.method,
        userId: user.id,
        userRole: user.role,
        requiredRoles: allowedRoles,
        error: "INSUFFICIENT_PERMISSIONS",
      });
      return sendProblem(
        c,
        createAuthProblem(
          "Insufficient permissions",
          403,
          "INSUFFICIENT_PERMISSIONS",
        ),
      );
    }

    logger.info("Authorization successful", {
      path: c.req.path,
      method: c.req.method,
      userId: user.id,
      role: user.role,
      requiredRoles: allowedRoles,
    });

    await next();
  };
}

/**
 * Extract user from authenticated context
 * Throws if user is not present (should be used after authMiddleware)
 */
export function getUser<TRole extends string>(
  c: Context<{Variables: AuthVariables<TRole>}>,
): UserPayload<TRole> {
  const user = c.get("user");
  return user;
}
