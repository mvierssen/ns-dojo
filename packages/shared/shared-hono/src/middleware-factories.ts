import type {MiddlewareHandler} from "hono";
import {bodyLimit} from "hono/body-limit";
import {compress} from "hono/compress";
import {cors} from "hono/cors";
import {etag} from "hono/etag";
import {logger} from "hono/logger";
import {secureHeaders} from "hono/secure-headers";
import {requestId} from "./middleware.js";

/**
 * CORS middleware factory
 *
 * Creates CORS middleware with configurable options
 * Default configuration is permissive (suitable for development)
 *
 * @example
 * ```ts
 * // Development (permissive)
 * const cors = createCorsMiddleware();
 *
 * // Production (restrictive)
 * const cors = createCorsMiddleware({
 *   origin: ['https://app.example.com'],
 *   credentials: true,
 * });
 * ```
 */
export function createCorsMiddleware(options?: {
  origin?: string | string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}): MiddlewareHandler {
  const {
    origin = "*",
    allowMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders = ["Content-Type", "Authorization", "Accept", "X-Request-ID"],
    exposeHeaders = ["X-Request-ID"],
    credentials = false,
    maxAge = 86_400, // 24 hours
  } = options ?? {};

  return cors({
    origin,
    allowMethods,
    allowHeaders,
    exposeHeaders,
    credentials,
    maxAge,
  });
}

/**
 * Body size limit middleware factory
 *
 * Protects against large uploads and JSON payloads
 * Default: 10 MB
 *
 * @example
 * ```ts
 * // Use default 10 MB limit
 * app.use(createBodyLimitMiddleware());
 *
 * // Per-route override for file uploads
 * app.post('/upload', createBodyLimitMiddleware({ maxSize: 50 * 1024 * 1024 }));
 * ```
 */
export function createBodyLimitMiddleware(options?: {
  maxSize?: number;
  onError?: (c: {
    json: (data: unknown, status: number) => Response;
    req: {path: string};
  }) => Response | Promise<Response>;
}): MiddlewareHandler {
  const {maxSize = 10 * 1024 * 1024, onError} = options ?? {};

  return bodyLimit({
    maxSize,
    onError:
      onError ??
      ((c) => {
        const sizeMB = Math.round(maxSize / 1024 / 1024);
        return c.json(
          {
            type: "about:blank#payload-too-large",
            title: "Payload Too Large",
            status: 413,
            detail: `Request body exceeds maximum allowed size of ${String(sizeMB)} MB`,
            instance: c.req.path,
          },
          413,
        );
      }),
  });
}

/**
 * Response compression middleware factory
 *
 * Compresses responses with gzip or deflate
 * Reduces bandwidth and improves response times
 *
 * @example
 * ```ts
 * app.use(createCompressionMiddleware());
 * ```
 */
export function createCompressionMiddleware(): MiddlewareHandler {
  return compress();
}

/**
 * ETag middleware factory
 *
 * Generates ETags for responses and handles conditional requests
 * Returns 304 Not Modified when content hasn't changed
 *
 * @example
 * ```ts
 * app.use(createEtagMiddleware());
 * ```
 */
export function createEtagMiddleware(): MiddlewareHandler {
  return etag();
}

/**
 * Secure headers middleware factory
 *
 * Sets OWASP-recommended security headers
 * Default configuration includes reasonable CSP for API documentation tools
 *
 * @example
 * ```ts
 * // Use defaults
 * app.use(createSecureHeadersMiddleware());
 *
 * // Custom CSP for your app
 * app.use(createSecureHeadersMiddleware({
 *   contentSecurityPolicy: {
 *     defaultSrc: ["'self'"],
 *     scriptSrc: ["'self'", "'unsafe-inline'"],
 *   },
 * }));
 * ```
 */
export function createSecureHeadersMiddleware(options?: {
  contentSecurityPolicy?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    baseUri?: string[];
    formAction?: string[];
    frameAncestors?: string[];
    upgradeInsecureRequests?: string[];
  };
  referrerPolicy?: string;
  strictTransportSecurity?: string;
}): MiddlewareHandler {
  const {contentSecurityPolicy, referrerPolicy, strictTransportSecurity} =
    options ?? {};

  return secureHeaders({
    contentSecurityPolicy: contentSecurityPolicy ?? {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'wasm-unsafe-eval'",
        "https://cdn.jsdelivr.net",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://fonts.scalar.com",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
    referrerPolicy: referrerPolicy ?? "strict-origin-when-cross-origin",
    strictTransportSecurity,
  });
}

/**
 * Request logging middleware factory
 *
 * Logs incoming requests with method, path, status, and response time
 * For production, consider using structured logging
 *
 * @example
 * ```ts
 * app.use(createLoggingMiddleware());
 * ```
 */
export function createLoggingMiddleware(): MiddlewareHandler {
  return logger();
}

/**
 * Request ID middleware factory
 *
 * Generates or extracts a unique ID for each request
 * Useful for distributed tracing and log correlation
 *
 * @example
 * ```ts
 * app.use(createRequestIdMiddleware());
 *
 * // Custom header name
 * app.use(createRequestIdMiddleware({ headerName: 'X-Trace-ID' }));
 * ```
 */
export function createRequestIdMiddleware(options?: {
  headerName?: string;
  generate?: () => string;
}): MiddlewareHandler {
  return requestId(options);
}

/**
 * Combined logging stack factory
 *
 * Creates middleware array with request ID and logging
 *
 * @example
 * ```ts
 * app.use(...createLoggingStack());
 * ```
 */
export function createLoggingStack(options?: {
  requestIdOptions?: {headerName?: string; generate?: () => string};
}): MiddlewareHandler[] {
  return [
    createRequestIdMiddleware(options?.requestIdOptions),
    createLoggingMiddleware(),
  ];
}
