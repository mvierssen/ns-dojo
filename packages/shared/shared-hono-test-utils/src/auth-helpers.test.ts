import {Hono} from "hono";
import {jwtVerify, type JWTPayload} from "jose";
import {beforeAll, describe, expect, it} from "vitest";
import {
  authDel,
  authGet,
  authPatch,
  authPost,
  authPut,
  generateTestToken,
  makeAuthenticatedRequest,
} from "./auth-helpers.js";

const TEST_SECRET = "test-jwt-secret-key-for-testing";

interface AuthHeaderResponse {
  auth: string;
}

interface MethodResponse {
  method: string;
}

interface ReceivedResponse {
  received: {data: string};
}

interface CustomHeaderResponse {
  custom: string;
}

interface HasAuthResponse {
  hasAuth: boolean;
}

interface HasAuthDataResponse {
  hasAuth: boolean;
  data: {value: string};
}

interface UpdatedResponse {
  updated: {name: string};
}

interface PatchedResponse {
  patched: {field: string};
}

interface DeletedResponse {
  hasAuth: boolean;
  deleted: boolean;
}

describe("Auth Helpers", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  describe("generateTestToken", () => {
    it("should include correct payload", async () => {
      const token = await generateTestToken({
        sub: "user-123",
        role: "admin",
        email: "admin@example.com",
      });

      const secretKey = new TextEncoder().encode(TEST_SECRET);
      const {payload} = await jwtVerify(token, secretKey);

      const jwtPayload = payload as JWTPayload & {
        role: string;
        email: string;
      };

      expect(jwtPayload.sub).toBe("user-123");
      expect(jwtPayload.role).toBe("admin");
      expect(jwtPayload.email).toBe("admin@example.com");
      expect(jwtPayload.iat).toBeTruthy();
      expect(jwtPayload.exp).toBeTruthy();
    });

    it("should use custom iat and exp if provided", async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = await generateTestToken({
        sub: "user-123",
        role: "user",
        iat: now,
        exp: now + 7200,
      });

      const secretKey = new TextEncoder().encode(TEST_SECRET);
      const {payload} = await jwtVerify(token, secretKey);

      expect(payload.iat).toBe(now);
      expect(payload.exp).toBe(now + 7200);
    });

    it("should use custom secret if provided", async () => {
      const customSecret = "custom-secret-key";
      const token = await generateTestToken(
        {
          sub: "user-123",
          role: "user",
        },
        customSecret,
      );

      const secretKey = new TextEncoder().encode(customSecret);
      const {payload} = await jwtVerify(token, secretKey);

      expect(payload.sub).toBe("user-123");
    });
  });

  describe("makeAuthenticatedRequest", () => {
    it("should add Authorization header with Bearer token", async () => {
      const app = new Hono();
      app.get("/test", (c) => {
        const auth = c.req.header("Authorization");
        return c.json({auth});
      });

      const res = await makeAuthenticatedRequest(app, "/test", {
        userId: "user-123",
        role: "user",
      });

      const json = (await res.json()) as AuthHeaderResponse;
      expect(json.auth).toMatch(/^Bearer /);
    });

    it("should send GET request by default", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({method: c.req.method}));

      const res = await makeAuthenticatedRequest(app, "/test", {
        userId: "user-123",
        role: "user",
      });

      const json = (await res.json()) as MethodResponse;
      expect(json.method).toBe("GET");
    });

    it("should send POST request with body", async () => {
      const app = new Hono();
      app.post("/test", async (c) => {
        const body: {data: string} = await c.req.json();
        return c.json({received: body});
      });

      const res = await makeAuthenticatedRequest(app, "/test", {
        userId: "user-123",
        role: "user",
        method: "POST",
        body: {data: "test"},
      });

      const json = (await res.json()) as ReceivedResponse;
      expect(json.received.data).toBe("test");
    });

    it("should include custom headers", async () => {
      const app = new Hono();
      app.get("/test", (c) => {
        const custom = c.req.header("X-Custom");
        return c.json({custom});
      });

      const res = await makeAuthenticatedRequest(app, "/test", {
        userId: "user-123",
        role: "user",
        headers: {"X-Custom": "value"},
      });

      const json = (await res.json()) as CustomHeaderResponse;
      expect(json.custom).toBe("value");
    });

    it("should support custom roles", async () => {
      type CustomRole = "admin" | "moderator" | "user";

      const app = new Hono();
      app.get("/test", (c) => c.json({success: true}));

      const res = await makeAuthenticatedRequest<unknown, CustomRole>(
        app,
        "/test",
        {
          userId: "user-123",
          role: "admin",
        },
      );

      expect(res.status).toBe(200);
    });
  });

  describe("authGet", () => {
    it("should make authenticated GET request", async () => {
      const app = new Hono();
      app.get("/profile", (c) => {
        const auth = c.req.header("Authorization");
        return c.json({hasAuth: Boolean(auth)});
      });

      const res = await authGet(app, "/profile", "user-123", "user");

      const json = (await res.json()) as HasAuthResponse;
      expect(json.hasAuth).toBe(true);
    });

    it("should use default role of 'user'", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({success: true}));

      const res = await authGet(app, "/test", "user-123");

      expect(res.status).toBe(200);
    });
  });

  describe("authPost", () => {
    it("should make authenticated POST request", async () => {
      const app = new Hono();
      app.post("/data", async (c) => {
        const body: {value: string} = await c.req.json();
        const auth = c.req.header("Authorization");
        return c.json({hasAuth: Boolean(auth), data: body});
      });

      const res = await authPost(app, "/data", "user-123", "user", {
        value: "test",
      });

      const json = (await res.json()) as HasAuthDataResponse;
      expect(json.hasAuth).toBe(true);
      expect(json.data.value).toBe("test");
    });
  });

  describe("authPut", () => {
    it("should make authenticated PUT request", async () => {
      const app = new Hono();
      app.put("/data/:id", async (c) => {
        const body: {name: string} = await c.req.json();
        return c.json({updated: body});
      });

      const res = await authPut(app, "/data/123", "user-123", "user", {
        name: "updated",
      });

      const json = (await res.json()) as UpdatedResponse;
      expect(json.updated.name).toBe("updated");
    });
  });

  describe("authPatch", () => {
    it("should make authenticated PATCH request", async () => {
      const app = new Hono();
      app.patch("/data/:id", async (c) => {
        const body: {field: string} = await c.req.json();
        return c.json({patched: body});
      });

      const res = await authPatch(app, "/data/123", "user-123", "user", {
        field: "value",
      });

      const json = (await res.json()) as PatchedResponse;
      expect(json.patched.field).toBe("value");
    });
  });

  describe("authDel", () => {
    it("should make authenticated DELETE request", async () => {
      const app = new Hono();
      app.delete("/data/:id", (c) => {
        const auth = c.req.header("Authorization");
        return c.json({hasAuth: Boolean(auth), deleted: true});
      });

      const res = await authDel(app, "/data/123", "user-123", "user");

      const json = (await res.json()) as DeletedResponse;
      expect(json.hasAuth).toBe(true);
      expect(json.deleted).toBe(true);
    });
  });
});
