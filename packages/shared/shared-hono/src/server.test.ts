import type {ServerType} from "@hono/node-server";
import {Hono} from "hono";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {createServer, setupGracefulShutdown} from "./server.js";

// Mock dependencies
vi.mock("@ns-dojo/shared-logging", () => ({
  createModuleLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

vi.mock("@hono/node-server", () => ({
  serve: vi.fn(
    (
      options: {port: number},
      callback?: (info: {address: string; port: number}) => void,
    ) => {
      // Call the callback immediately with mock info
      if (callback) {
        callback({address: "127.0.0.1", port: options.port});
      }
      // Return mock server
      return {
        close: vi.fn((cb?: () => void) => {
          if (cb) cb();
        }),
      };
    },
  ),
}));

describe("server", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.get("/", (c) => c.text("Hello"));
    vi.clearAllMocks();
  });

  describe("createServer", () => {
    it("should skip loading env when loadEnv is false", async () => {
      const {config: dotenvConfig} = await import("dotenv");

      vi.clearAllMocks();

      createServer(app, {
        loadEnv: false,
      });

      expect(dotenvConfig).not.toHaveBeenCalled();
    });

    it("should load env by default", async () => {
      const {config: dotenvConfig} = await import("dotenv");

      vi.clearAllMocks();

      createServer(app);

      expect(dotenvConfig).toHaveBeenCalled();
    });
  });

  describe("setupGracefulShutdown", () => {
    let mockServer: ServerType;

    beforeEach(() => {
      mockServer = {
        close: vi.fn((cb?: (err?: Error) => void) => {
          if (cb) cb();
        }),
      } as unknown as ServerType;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should setup signal handlers and call server.close on SIGTERM", () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
        // Prevent actual exit
      }) as never);

      setupGracefulShutdown(mockServer);

      // Emit SIGTERM
      process.emit("SIGTERM" as never);

      expect(mockServer.close).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should setup signal handlers and call server.close on SIGINT", () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
        // Prevent actual exit
      }) as never);

      setupGracefulShutdown(mockServer);

      // Emit SIGINT
      process.emit("SIGINT" as never);

      expect(mockServer.close).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should call cleanup function when provided", () => {
      const cleanup = vi.fn(() => Promise.resolve());

      vi.spyOn(process, "exit").mockImplementation((() => {
        // Prevent actual exit
      }) as never);

      setupGracefulShutdown(mockServer, cleanup);

      process.emit("SIGTERM" as never);

      // Verify cleanup was called
      expect(cleanup).toHaveBeenCalled();
    });

    it("should handle cleanup errors gracefully", () => {
      const cleanup = vi.fn().mockRejectedValue(new Error("Cleanup failed"));

      vi.spyOn(process, "exit").mockImplementation((() => {
        // Prevent actual exit
      }) as never);

      setupGracefulShutdown(mockServer, cleanup);

      process.emit("SIGTERM" as never);

      // Verify cleanup was called (even if it fails)
      expect(cleanup).toHaveBeenCalled();
    });
  });
});
