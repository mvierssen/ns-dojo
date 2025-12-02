import {Hono, type MiddlewareHandler} from "hono";
import {describe, expect, it} from "vitest";
import {
  combine,
  conditional,
  getApiVersion,
  parseApiVersion,
  requestId,
  skipPaths,
  versionMiddleware,
} from "../src/middleware.js";

describe("Middleware Utilities", () => {
  describe("parseApiVersion", () => {
    it("should parse v1 from Accept header", () => {
      expect(parseApiVersion("application/vnd.myapp.v1+json")).toBe("v1");
    });

    it("should parse v2 from Accept header", () => {
      expect(parseApiVersion("application/vnd.myapp.v2+json")).toBe("v2");
    });

    it("should default to v1 for application/json", () => {
      expect(parseApiVersion("application/json")).toBe("v1");
    });

    it("should default to v1 for undefined", () => {
      expect(parseApiVersion()).toBe("v1");
    });

    it("should default to v1 for unsupported versions", () => {
      expect(parseApiVersion("application/vnd.myapp.v99+json")).toBe("v1");
    });
  });

  describe("versionMiddleware", () => {
    it("should attach version to context", async () => {
      const app = new Hono();

      app.use("*", versionMiddleware());
      app.get("/test", (c) => {
        const version = getApiVersion(c);
        return c.json({version});
      });

      const res = await app.request("/test", {
        headers: {
          Accept: "application/vnd.myapp.v2+json",
        },
      });

      const json = (await res.json()) as {version: string};
      expect(json.version).toBe("v2");
    });

    it("should default to v1 without Accept header", async () => {
      const app = new Hono();

      app.use("*", versionMiddleware());
      app.get("/test", (c) => {
        const version = getApiVersion(c);
        return c.json({version});
      });

      const res = await app.request("/test");

      const json = (await res.json()) as {version: string};
      expect(json.version).toBe("v1");
    });
  });

  describe("combine", () => {
    it("should execute multiple middleware in order", async () => {
      const app = new Hono();
      const order: number[] = [];

      const middleware1: MiddlewareHandler = async (_c, next) => {
        order.push(1);
        await next();
      };
      const middleware2: MiddlewareHandler = async (_c, next) => {
        order.push(2);
        await next();
      };

      app.use("*", combine(middleware1, middleware2));
      app.get("/test", (c) => c.json({ok: true}));

      await app.request("/test");

      expect(order).toEqual([1, 2]);
    });
  });

  describe("conditional", () => {
    it("should run middleware when condition is true", async () => {
      const app = new Hono();
      let executed = false;

      const middleware: MiddlewareHandler = async (_c, next) => {
        executed = true;
        await next();
      };

      app.use(
        "*",
        conditional(() => true, middleware),
      );
      app.get("/test", (c) => c.json({ok: true}));

      await app.request("/test");

      expect(executed).toBe(true);
    });

    it("should skip middleware when condition is false", async () => {
      const app = new Hono();
      let executed = false;

      const middleware: MiddlewareHandler = async (_c, next) => {
        executed = true;
        await next();
      };

      app.use(
        "*",
        conditional(() => false, middleware),
      );
      app.get("/test", (c) => c.json({ok: true}));

      await app.request("/test");

      expect(executed).toBe(false);
    });
  });

  describe("skipPaths", () => {
    it("should skip middleware for specified paths", async () => {
      const app = new Hono();
      let executed = false;

      const middleware: MiddlewareHandler = async (_c, next) => {
        executed = true;
        await next();
      };

      app.use("*", skipPaths(["/health"], middleware));
      app.get("/health", (c) => c.json({ok: true}));

      await app.request("/health");

      expect(executed).toBe(false);
    });

    it("should run middleware for non-skipped paths", async () => {
      const app = new Hono();
      let executed = false;

      const middleware: MiddlewareHandler = async (_c, next) => {
        executed = true;
        await next();
      };

      app.use("*", skipPaths(["/health"], middleware));
      app.get("/api", (c) => c.json({ok: true}));

      await app.request("/api");

      expect(executed).toBe(true);
    });
  });

  describe("requestId", () => {
    it("should generate request ID when not provided", async () => {
      const app = new Hono<{Variables: {requestId: string}}>();

      app.use("*", requestId());
      app.get("/test", (c) => {
        const id = c.get("requestId");
        return c.json({requestId: id});
      });

      const res = await app.request("/test");
      const json = (await res.json()) as {requestId: string};

      expect(json.requestId).toBeDefined();
      expect(typeof json.requestId).toBe("string");
      expect(res.headers.get("X-Request-ID")).toBe(json.requestId);
    });

    it("should use provided request ID from header", async () => {
      const app = new Hono<{Variables: {requestId: string}}>();
      const testId = "test-request-123";

      app.use("*", requestId());
      app.get("/test", (c) => {
        const id = c.get("requestId");
        return c.json({requestId: id});
      });

      const res = await app.request("/test", {
        headers: {
          "X-Request-ID": testId,
        },
      });
      const json = (await res.json()) as {requestId: string};

      expect(json.requestId).toBe(testId);
      expect(res.headers.get("X-Request-ID")).toBe(testId);
    });

    it("should support custom header name", async () => {
      const app = new Hono<{Variables: {requestId: string}}>();
      const testId = "custom-id-456";

      app.use("*", requestId({headerName: "X-Custom-ID"}));
      app.get("/test", (c) => {
        const id = c.get("requestId");
        return c.json({requestId: id});
      });

      const res = await app.request("/test", {
        headers: {
          "X-Custom-ID": testId,
        },
      });
      const json = (await res.json()) as {requestId: string};

      expect(json.requestId).toBe(testId);
      expect(res.headers.get("X-Custom-ID")).toBe(testId);
    });
  });
});
