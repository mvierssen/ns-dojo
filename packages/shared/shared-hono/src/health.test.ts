import {Hono} from "hono";
import {describe, expect, it, vi} from "vitest";
import {livenessHandler, readinessHandler, type HealthCheck} from "./health.js";

// Mock logger
vi.mock("@ns-dojo/shared-logging", () => ({
  createModuleLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe("health", () => {
  describe("livenessHandler", () => {
    it("should return 200 OK", async () => {
      const app = new Hono();
      app.get("/health/liveness", livenessHandler);

      const res = await app.request("/health/liveness");

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("OK");
    });
  });

  describe("readinessHandler", () => {
    it("should return 200 when no checks provided", async () => {
      const app = new Hono();
      app.get("/health/readiness", readinessHandler());

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(200);

      const json = (await res.json()) as {status: string; checks: unknown[]};
      expect(json.status).toBe("ready");
      expect(json.checks).toEqual([]);
    });

    it("should return 200 when all checks pass", async () => {
      const checks: HealthCheck[] = [
        {
          name: "database",
          check: () => Promise.resolve(true),
        },
        {
          name: "redis",
          check: () => Promise.resolve(true),
        },
      ];

      const app = new Hono();
      app.get("/health/readiness", readinessHandler(checks));

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(200);

      const json = (await res.json()) as {
        status: string;
        checks: {name: string; healthy: boolean}[];
      };
      expect(json.status).toBe("ready");
      expect(json.checks).toHaveLength(2);
      expect(json.checks[0]).toEqual({name: "database", healthy: true});
      expect(json.checks[1]).toEqual({name: "redis", healthy: true});
    });

    it("should return 503 when a check fails", async () => {
      const checks: HealthCheck[] = [
        {
          name: "database",
          check: () => Promise.resolve(true),
        },
        {
          name: "redis",
          check: () => Promise.resolve(false),
        },
      ];

      const app = new Hono();
      app.get("/health/readiness", readinessHandler(checks));

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(503);

      const json = (await res.json()) as {
        status: string;
        checks: {name: string; healthy: boolean}[];
      };
      expect(json.status).toBe("not_ready");
      expect(json.checks[0]).toEqual({name: "database", healthy: true});
      expect(json.checks[1]).toEqual({name: "redis", healthy: false});
    });

    it("should return 503 when a check throws an error", async () => {
      const checks: HealthCheck[] = [
        {
          name: "database",
          check: () => Promise.reject(new Error("Connection failed")),
        },
      ];

      const app = new Hono();
      app.get("/health/readiness", readinessHandler(checks));

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(503);

      const json = (await res.json()) as {
        status: string;
        checks: {name: string; healthy: boolean; error?: string}[];
      };
      expect(json.status).toBe("not_ready");
      expect(json.checks[0]).toEqual({
        name: "database",
        healthy: false,
        error: "Connection failed",
      });
    });

    it("should handle non-Error exceptions", async () => {
      const checks: HealthCheck[] = [
        {
          name: "service",
          check: () => {
            const error = new Error("Test error");
            error.message = "";
            return Promise.reject(error);
          },
        },
      ];

      const app = new Hono();
      app.get("/health/readiness", readinessHandler(checks));

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(503);

      const json = (await res.json()) as {
        status: string;
        checks: {name: string; healthy: boolean; error?: string}[];
      };
      expect(json.checks[0]?.error).toBe("");
    });

    it("should continue checking after a failure", async () => {
      const checks: HealthCheck[] = [
        {
          name: "database",
          check: () => Promise.resolve(false),
        },
        {
          name: "redis",
          check: () => Promise.resolve(true),
        },
        {
          name: "s3",
          check: () => Promise.resolve(true),
        },
      ];

      const app = new Hono();
      app.get("/health/readiness", readinessHandler(checks));

      const res = await app.request("/health/readiness");

      expect(res.status).toBe(503);

      const json = (await res.json()) as {
        status: string;
        checks: {name: string; healthy: boolean}[];
      };
      expect(json.checks).toHaveLength(3);
      expect(json.checks[0]).toEqual({name: "database", healthy: false});
      expect(json.checks[1]).toEqual({name: "redis", healthy: true});
      expect(json.checks[2]).toEqual({name: "s3", healthy: true});
    });
  });
});
