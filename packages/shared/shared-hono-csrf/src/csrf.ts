import {generateCsrfToken, validateCsrfToken} from "@ns-dojo/shared-csrf";
import {createModuleLogger} from "@ns-dojo/shared-logging";
import type {Context, MiddlewareHandler} from "hono";
import type {HonoCsrfConfig} from "./types.js";

const logger = createModuleLogger("CSRF");

/**
 * CSRF token storage in context variables
 */
interface CsrfVariables {
  csrfToken?: string;
}

/**
 * Get default CSRF configuration from environment variables
 */
function getDefaultHonoConfig(): HonoCsrfConfig {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error(
      "CSRF_SECRET environment variable is required. Please set it to a secure random string.",
    );
  }
  return {
    secret,
    cookieName: "__csrf",
    headerName: "x-csrf-token",
    fieldName: "_csrf",
    tokenLength: 32,
  };
}

/**
 * Extract session ID from request context
 * Uses user ID from authenticated context or generates anonymous session
 */
function getSessionId(c: Context): string {
  // Try to get authenticated user ID
  const user = c.get("user") as {id?: string} | undefined;
  if (user?.id) {
    return user.id;
  }

  // Fall back to session cookie or IP-based session
  const sessionCookie = c.req
    .header("cookie")
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("session="))
    ?.split("=")[1];

  if (sessionCookie) {
    return sessionCookie;
  }

  // Last resort: use IP address (not ideal but works for stateless apps)
  const ip =
    c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "anonymous";
  return `anon-${ip}`;
}

/**
 * CSRF token generator middleware
 * Generates and sets a CSRF token in both response cookie and context
 * Should be applied to routes that render forms or SPA entry points
 */
export function csrfTokenGenerator(
  config?: HonoCsrfConfig,
): MiddlewareHandler<{Variables: CsrfVariables}> {
  return async (c, next) => {
    try {
      const resolvedConfig = config ?? getDefaultHonoConfig();
      const sessionId = getSessionId(c);
      const token = generateCsrfToken(sessionId, {
        secret: resolvedConfig.secret,
        tokenLength: resolvedConfig.tokenLength ?? 32,
      });

      // Set cookie with secure options
      const isProduction = process.env.NODE_ENV === "production";
      const cookieName = resolvedConfig.cookieName ?? "__csrf";
      const cookieOptions = [
        `${cookieName}=${token}`,
        "Path=/",
        "HttpOnly=false", // Must be accessible to JavaScript
        "SameSite=Lax", // Allow cross-origin for localhost dev
        "Max-Age=3600", // 1 hour
        isProduction ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; ");

      c.header("Set-Cookie", cookieOptions);
      c.set("csrfToken", token);

      logger.debug("CSRF token generated", {
        sessionId,
        token: token.slice(0, 8) + "...",
      });

      await next();
    } catch (error) {
      logger.error("Failed to generate CSRF token", {error});
      throw error;
    }
  };
}

/**
 * CSRF protection middleware
 * Validates CSRF token for state-changing HTTP methods (POST, PUT, PATCH, DELETE)
 * Checks for token in X-CSRF-Token header and validates against cookie
 */
export function csrfProtection(config?: HonoCsrfConfig): MiddlewareHandler {
  return async (c, next) => {
    try {
      const resolvedConfig = config ?? getDefaultHonoConfig();

      // Skip validation in test environment
      if (process.env.NODE_ENV === "test") {
        await next();
        return;
      }

      const method = c.req.method;

      // Skip validation for safe methods
      if (["GET", "HEAD", "OPTIONS"].includes(method)) {
        await next();
        return;
      }

      const sessionId = getSessionId(c);

      // Extract token from header
      const headerName = resolvedConfig.headerName ?? "x-csrf-token";
      const headerToken = c.req.header(headerName);

      // Extract token from cookie
      const cookieName = resolvedConfig.cookieName ?? "__csrf";
      const cookieToken = c.req
        .header("cookie")
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith(`${cookieName}=`))
        ?.split("=")[1];

      if (!headerToken) {
        logger.warn("CSRF token missing in header", {method, path: c.req.path});
        return c.json(
          {
            type: "about:blank#csrf-token-missing",
            title: "CSRF Token Missing",
            status: 403,
            detail: `CSRF token required in ${headerName} header`,
            instance: c.req.path,
          },
          403,
        );
      }

      if (!cookieToken) {
        logger.warn("CSRF cookie missing", {method, path: c.req.path});
        return c.json(
          {
            type: "about:blank#csrf-cookie-missing",
            title: "CSRF Cookie Missing",
            status: 403,
            detail: "CSRF cookie not found. Please refresh the page.",
            instance: c.req.path,
          },
          403,
        );
      }

      // Validate that tokens match
      if (headerToken !== cookieToken) {
        logger.warn("CSRF tokens do not match", {
          method,
          path: c.req.path,
          sessionId,
        });
        return c.json(
          {
            type: "about:blank#csrf-tokens-mismatch",
            title: "CSRF Tokens Mismatch",
            status: 403,
            detail: "CSRF token in header does not match cookie token.",
            instance: c.req.path,
          },
          403,
        );
      }

      // Validate token signature
      const validation = validateCsrfToken(cookieToken, sessionId, {
        secret: resolvedConfig.secret,
        tokenLength: resolvedConfig.tokenLength ?? 32,
      });

      if (!validation.valid) {
        logger.warn("CSRF token validation failed", {
          method,
          path: c.req.path,
          sessionId,
        });
        return c.json(
          {
            type: "about:blank#csrf-validation-failed",
            title: "CSRF Validation Failed",
            status: 403,
            detail:
              "CSRF token validation failed. Please refresh and try again.",
            instance: c.req.path,
          },
          403,
        );
      }

      logger.debug("CSRF token validated successfully", {
        method,
        path: c.req.path,
      });
      await next();
    } catch (error) {
      logger.error("CSRF protection error", {error});
      throw error;
    }
  };
}

/**
 * Route handler to return current CSRF token
 * Useful for SPAs that need to fetch the token via API
 */
export function getCsrfTokenHandler(c: Context): Response {
  const token = c.get("csrfToken") as string | undefined;
  if (!token) {
    return c.json(
      {
        type: "about:blank#csrf-token-not-generated",
        title: "CSRF Token Not Available",
        status: 500,
        detail:
          "CSRF token was not generated. Ensure csrfTokenGenerator middleware is applied.",
        instance: c.req.path,
      },
      500,
    );
  }

  return c.json({csrfToken: token});
}
