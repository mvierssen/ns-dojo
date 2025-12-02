import type {Context, MiddlewareHandler} from "hono";
import {jwt} from "hono/jwt";

/**
 * Standard JWT claims
 */
export interface JwtClaims {
  /** Subject (user ID) */
  sub: string;
  /** Issued at (Unix timestamp) */
  iat: number;
  /** Expiration time (Unix timestamp) */
  exp: number;
  /** Issuer */
  iss?: string;
  /** Audience */
  aud?: string | string[];
  /** JWT ID */
  jti?: string;
  /** Additional custom claims */
  [key: string]: unknown;
}

/**
 * Context variables for JWT authentication
 */
export interface JwtVariables {
  /** The decoded JWT payload */
  jwtPayload: JwtClaims;
  /** The user ID from the JWT sub claim */
  userId: string;
}

/**
 * Type helper to extend Hono context with JWT variables
 */
export type JwtContext = Context<{Variables: JwtVariables}>;

/**
 * Extract user ID from JWT payload and attach to context
 */
const attachJwtUserHandler: MiddlewareHandler<{
  Variables: JwtVariables;
}> = async (c, next) => {
  const payload = c.get("jwtPayload");

  if (!payload.sub) {
    throw new Error("JWT payload missing sub claim");
  }

  // Attach userId for easy access
  c.set("userId", payload.sub);

  await next();
};

export function attachJwtUser(): MiddlewareHandler<{
  Variables: JwtVariables;
}> {
  return attachJwtUserHandler;
}

/**
 * Create a JWT middleware with user attachment
 * Combines Hono's JWT middleware with our user extraction
 */
export function createJwtMiddleware(secret: string): MiddlewareHandler[] {
  return [jwt({secret}), attachJwtUser()];
}

/**
 * Get the current user ID from context
 * Throws if not authenticated (should be used after JWT middleware)
 */
export function getUserId(c: JwtContext): string {
  const userId = c.get("userId");
  if (!userId) {
    throw new Error("Not authenticated - JWT middleware not applied");
  }
  return userId;
}

/**
 * Get the full JWT payload from context
 * Throws if not authenticated (should be used after JWT middleware)
 */
export function getJwtPayload(c: JwtContext): JwtClaims {
  return c.get("jwtPayload");
}

/**
 * Check if the user has a specific role
 * Assumes roles are stored in the JWT as a 'roles' array claim
 */
export function hasRole(c: JwtContext, role: string): boolean {
  const payload = getJwtPayload(c);
  const roles = payload.roles;

  if (!Array.isArray(roles)) {
    return false;
  }

  return roles.includes(role);
}

/**
 * Middleware to require a specific role
 */
export function requireRole(role: string): MiddlewareHandler<{
  Variables: JwtVariables;
}> {
  return async (c, next) => {
    if (!hasRole(c as JwtContext, role)) {
      return c.json(
        {
          type: "about:blank#forbidden",
          title: "Forbidden",
          status: 403,
          detail: `Role '${role}' required`,
        },
        403,
      );
    }
    await next();
  };
}
