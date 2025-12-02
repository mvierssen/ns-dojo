import {serve} from "@hono/node-server";
import {createNodeWebSocket} from "@hono/node-ws";
import {createApp} from "./app.js";

/**
 * Server bootstrap with:
 * - @hono/node-server for Node 22+ support
 * - @hono/node-ws for WebSocket support
 * - Graceful shutdown handling
 * - Configurable port via environment
 */

// Create the Hono app
const app = createApp();

// Create WebSocket helpers
const wsHelpers = createNodeWebSocket({app});

// Get port from environment or default to 3000
const port = Number(process.env.PORT) || 3000;

// Start the server
const server = serve({
  fetch: app.fetch,
  port,
});

// Inject WebSocket support into the Node server
wsHelpers.injectWebSocket(server);

console.log(`
🚀 Server running on http://localhost:${String(port)}

📚 Endpoints:
  - Health:     http://localhost:${String(port)}/healthz
  - API v1:     http://localhost:${String(port)}/api/v1
  - API v2:     http://localhost:${String(port)}/api/v2
  - Docs:       http://localhost:${String(port)}/docs

🔌 WebSocket:
  - Chat:       ws://localhost:${String(port)}/api/v1/ws/chat

📡 SSE Streaming:
  - AI:         http://localhost:${String(port)}/api/v1/stream/ai?prompt=Hello
  - Progress:   http://localhost:${String(port)}/api/v1/stream/progress

📤 File Upload:
  - Upload:     http://localhost:${String(port)}/api/v1/upload

Environment:
  - NODE_ENV:   ${process.env.NODE_ENV ?? "development"}
  - PORT:       ${String(port)}
`);

/**
 * Graceful shutdown handling
 *
 * Kubernetes sends SIGTERM before killing the pod.
 * We should:
 * 1. Stop accepting new connections
 * 2. Finish processing existing requests
 * 3. Close database connections
 * 4. Exit cleanly
 */

let isShuttingDown = false;

function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log("Server closed. No longer accepting connections.");

    // Close database connections here
    // await db.close();

    // Close other resources (Redis, etc.)
    // await redis.quit();

    console.log("Graceful shutdown complete. Exiting.");
    process.exit(0);
  });

  // Force shutdown after 30 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30_000);
}

// Listen for termination signals
process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

export {app, server};
