import {serve, type ServerType} from "@hono/node-server";
import {createModuleLogger} from "@ns-dojo/shared-logging";
import {config as loadEnvFile} from "dotenv";
import type {Env, Hono} from "hono";

/**
 * Server configuration options
 */
export interface ServerConfig {
  /**
   * Port to listen on (default: 3000)
   */
  port?: number;

  /**
   * Host to bind to (default: "0.0.0.0")
   */
  host?: string;

  /**
   * Service name for logging (default: "hono-app")
   */
  serviceName?: string;

  /**
   * Whether to load .env file (default: true)
   */
  loadEnv?: boolean;

  /**
   * Custom cleanup function to run on shutdown
   */
  cleanup?: () => Promise<void>;
}

/**
 * Create and start a Hono server with graceful shutdown handling
 *
 * This factory function:
 * - Loads environment variables from .env
 * - Starts the server on the specified port/host
 * - Sets up graceful shutdown handlers for SIGTERM and SIGINT
 * - Logs startup and shutdown events
 *
 * @param app - Hono application instance (works with Hono, OpenAPIHono, etc.)
 * @param config - Server configuration options
 * @returns Promise that resolves to the server instance
 *
 * @example
 * ```typescript
 * import { createServer } from '@ns-dojo/shared-hono';
 * import { Hono } from 'hono';
 *
 * const app = new Hono();
 * app.get('/', (c) => c.text('Hello World'));
 *
 * await createServer(app, {
 *   port: 3001,
 *   serviceName: 'my-api',
 *   cleanup: async () => {
 *     await database.close();
 *   }
 * });
 * ```
 */
export function createServer<E extends Env = Env>(
  app: Hono<E>,
  serverConfig: ServerConfig = {},
): ServerType {
  const {
    port = 3000,
    host = "0.0.0.0",
    serviceName = "hono-app",
    loadEnv = true,
    cleanup,
  } = serverConfig;

  // Load environment variables
  if (loadEnv) {
    loadEnvFile();
  }

  const logger = createModuleLogger(serviceName);

  // Start server
  const server = serve(
    {
      fetch: app.fetch,
      port,
      hostname: host,
    },
    (info) => {
      logger.info(
        `${serviceName} listening on ${info.address}:${String(info.port)}`,
      );
    },
  );

  // Setup graceful shutdown
  setupGracefulShutdown(server, cleanup);

  return server;
}

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT
 *
 * @param server - Node.js HTTP server instance
 * @param cleanup - Optional cleanup function to run before shutdown
 *
 * @example
 * ```typescript
 * import { serve } from '@hono/node-server';
 * import { setupGracefulShutdown } from '@ns-dojo/shared-hono';
 *
 * const server = serve({ fetch: app.fetch, port: 3000 });
 *
 * setupGracefulShutdown(server, async () => {
 *   await database.close();
 *   await redis.quit();
 * });
 * ```
 */
export function setupGracefulShutdown(
  server: ServerType,
  cleanup?: () => Promise<void>,
): void {
  const logger = createModuleLogger("server");

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    // Run custom cleanup if provided
    if (cleanup) {
      try {
        await cleanup();
        logger.info("Cleanup completed successfully");
      } catch (error) {
        logger.error("Error during cleanup", {error});
      }
    }

    // Close server
    server.close((err?: Error) => {
      if (err) {
        logger.error("Error during server shutdown", {error: err});
        process.exit(1);
      }
      logger.info("Server closed successfully");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}
