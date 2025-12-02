import type {Context, MiddlewareHandler} from "hono";

/**
 * API version extracted from Accept header
 */
export type ApiVersion = "v1" | "v2";

/**
 * Context variables for versioning
 */
export interface VersionVariables {
  /** The API version requested by the client */
  apiVersion: ApiVersion;
}

/**
 * Parse API version from Accept header
 * Supports: application/vnd.yourapp.v1+json, application/vnd.yourapp.v2+json
 * Falls back to v1 for standard application/json
 */
export function parseApiVersion(acceptHeader?: string): ApiVersion {
  if (!acceptHeader) {
    return "v1";
  }

  // Match version in Accept header (e.g., application/vnd.yourapp.v1+json)
  const versionMatch = /\.v(\d+)\+json/i.exec(acceptHeader);

  if (versionMatch) {
    const version = versionMatch[1];
    if (version === "1" || version === "2") {
      return `v${version}` as ApiVersion;
    }
  }

  // Default to v1 for standard Accept headers
  return "v1";
}

/**
 * Middleware to extract and attach API version from Accept header
 */
const versionHandler: MiddlewareHandler<{
  Variables: VersionVariables;
}> = async (c, next) => {
  const accept = c.req.header("Accept");
  const version = parseApiVersion(accept);
  c.set("apiVersion", version);
  await next();
};

export function versionMiddleware(): MiddlewareHandler<{
  Variables: VersionVariables;
}> {
  return versionHandler;
}

/**
 * Get the current API version from context
 */
export function getApiVersion(c: Context): ApiVersion {
  return c.get("apiVersion") as ApiVersion;
}

/**
 * Combine multiple middleware handlers into one
 * Useful for applying conditional middleware based on route or context
 */
export function combine(...handlers: MiddlewareHandler[]): MiddlewareHandler {
  return async (c, next) => {
    let index = 0;

    const dispatch = async (): Promise<void> => {
      if (index >= handlers.length) {
        await next();
        return;
      }

      const handler = handlers[index];
      if (!handler) {
        return;
      }
      index++;

      await handler(c, dispatch);
    };

    await dispatch();
  };
}

/**
 * Conditional middleware - only run handler if condition is true
 */
export function conditional(
  condition: (c: Context) => boolean,
  handler: MiddlewareHandler,
): MiddlewareHandler {
  return async (c, next) => {
    if (condition(c)) {
      await handler(c, next);
    } else {
      await next();
    }
  };
}

/**
 * Skip middleware for specific paths
 */
export function skipPaths(
  paths: string[],
  handler: MiddlewareHandler,
): MiddlewareHandler {
  return conditional((c) => !paths.includes(c.req.path), handler);
}

/**
 * Apply middleware only to specific paths
 */
export function onlyPaths(
  paths: string[],
  handler: MiddlewareHandler,
): MiddlewareHandler {
  return conditional((c) => paths.includes(c.req.path), handler);
}

/**
 * Skip middleware for specific HTTP methods
 */
export function skipMethods(
  methods: string[],
  handler: MiddlewareHandler,
): MiddlewareHandler {
  const methodsUpper = new Set(methods.map((m) => m.toUpperCase()));
  return conditional(
    (c) => !methodsUpper.has(c.req.method.toUpperCase()),
    handler,
  );
}

/**
 * Request ID middleware
 * Generates or extracts a request ID for tracing
 */
export function requestId(options?: {
  headerName?: string;
  generate?: () => string;
}): MiddlewareHandler {
  const {headerName = "X-Request-ID", generate = () => crypto.randomUUID()} =
    options ?? {};

  return async (c, next) => {
    // Try to get from header first, otherwise generate
    const id = c.req.header(headerName) ?? generate();

    // Store in context
    c.set("requestId", id);

    // Set response header
    c.header(headerName, id);

    await next();
  };
}
