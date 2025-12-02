import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST ?? "0.0.0.0";

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Set content type
  res.setHeader("Content-Type", "application/json");

  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  const path = url.pathname;
  const method = req.method;

  // Simple routing
  if (path === "/" && method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        message: "Hello World!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      }),
    );
  } else if (path === "/health" && method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    );
  } else if (path === "/api/echo" && method === "POST") {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const data: unknown = JSON.parse(body);
        res.writeHead(200);
        res.end(
          JSON.stringify({
            echo: data,
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (error) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Invalid JSON",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
        );
      }
    });
  } else {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        error: "Not Found",
        path,
        method,
        timestamp: new Date().toISOString(),
      }),
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT.toString()}`);
  console.log(`📊 Health check: http://${HOST}:${PORT.toString()}/health`);
  console.log(`🔄 Echo endpoint: http://${HOST}:${PORT.toString()}/api/echo`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

export {server};
