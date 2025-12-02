import {OpenAPIHono} from "@hono/zod-openapi";
import {createErrorHandler} from "@ns-dojo/shared-hono/errors";
import {versionMiddleware} from "@ns-dojo/shared-hono/middleware";
import {
  bodyLimitMiddleware,
  compressionMiddleware,
  corsMiddleware,
  etagMiddleware,
  loggingStack,
  secureHeadersMiddleware,
} from "./middlewares/index.js";
import {defaultHook} from "./openapi/config.js";
import {createSwaggerUIHandler} from "./openapi/spec.js";
import {healthRouter} from "./routes/health.js";
import {v1Router} from "./routes/v1/index.js";
import {v2Router} from "./routes/v2/index.js";

/**
 * Create the Hono application
 *
 * Middleware stack (order matters!):
 * 1. CORS (must be early for preflight requests)
 * 2. Secure headers (baseline OWASP headers)
 * 3. Request ID & logging (for tracing)
 * 4. Body limit (protect against large payloads)
 * 5. Compression (reduce bandwidth)
 * 6. ETag (conditional requests)
 * 7. Version middleware (header-based API versioning)
 *
 * Routes:
 * - /openapi.json       - OpenAPI specification
 * - /docs               - Interactive API documentation (Swagger UI)
 * - /healthz, /readyz   - Health checks
 * - /api/v1/*           - API v1 endpoints
 * - /api/v2/*           - API v2 endpoints (placeholder)
 *
 * Note: JWT middleware is applied per-route or per-router as needed.
 * See middlewares/jwt.ts for usage examples.
 */

export function createApp() {
  const app = new OpenAPIHono({defaultHook});

  // 1. CORS (must be early)
  app.use("*", corsMiddleware);

  // 2. Secure headers
  app.use("*", secureHeadersMiddleware);

  // 3. Request ID & Logging
  app.use("*", ...loggingStack);

  // 4. Body limit
  app.use("*", bodyLimitMiddleware);

  // 5. Compression
  app.use("*", compressionMiddleware);

  // 6. ETag
  app.use("*", etagMiddleware);

  // 7. API versioning
  app.use("/api/*", versionMiddleware());

  // OpenAPI spec endpoint - use app's built-in OpenAPI document generation
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Hono Backend API",
      version: "1.0.0",
      description:
        "Comprehensive Hono backend reference template with Node 22+, Zod v4, header versioning, SSE, WebSockets, and OpenAPI",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development",
      },
    ],
  });

  // Swagger UI endpoint
  app.get("/docs", createSwaggerUIHandler());

  // Health check routes (no /api prefix, for Kubernetes)
  app.route("/", healthRouter);

  // API routes
  app.route("/api/v1", v1Router);
  app.route("/api/v2", v2Router);

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      name: "template-backend-hono",
      version: "1.0.0",
      message: "Hono backend template with Node 22+, Zod v4, and OpenAPI",
      endpoints: {
        health: {
          liveness: "/healthz",
          readiness: "/readyz",
        },
        api: {
          v1: "/api/v1",
          v2: "/api/v2",
        },
        documentation: {
          spec: "/openapi.json",
          ui: "/docs",
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        type: "about:blank#not-found",
        title: "Not Found",
        status: 404,
        detail: `Route ${c.req.method} ${c.req.path} not found`,
        instance: c.req.path,
      },
      404,
    );
  });

  // Global error handler
  app.onError(
    createErrorHandler({
      logErrors: true,
      includeStackTrace: process.env.NODE_ENV !== "production",
    }),
  );

  return app;
}
