import {Hono} from "hono";
import {describe, expect, it} from "vitest";
import {del, get, makeRequest, patch, post, put} from "./request-helpers.js";

interface MessageResponse {
  message: string;
}

interface ReceivedResponse {
  received: {data: string};
}

interface HeaderResponse {
  header: string;
}

interface UsersResponse {
  users: unknown[];
}

interface AuthResponse {
  auth: string;
}

interface CreatedResponse {
  created: {name: string};
}

interface ContentTypeResponse {
  contentType: string;
}

interface SuccessResponse {
  success: boolean;
}

interface UpdatedResponse {
  updated: {name: string};
}

interface PatchedResponse {
  patched: {name: string};
}

interface DeletedResponse {
  deleted: boolean;
}

describe("Request Helpers", () => {
  describe("makeRequest", () => {
    it("should make a basic GET request", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({message: "success"}));

      const res = await makeRequest(app, "/test");

      expect(res.status).toBe(200);
      const json = (await res.json()) as MessageResponse;
      expect(json.message).toBe("success");
    });

    it("should make a POST request with body", async () => {
      const app = new Hono();
      app.post("/test", async (c) => {
        const body: {data: string} = await c.req.json();
        return c.json({received: body});
      });

      const res = await makeRequest(app, "/test", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({data: "test"}),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as ReceivedResponse;
      expect(json.received.data).toBe("test");
    });

    it("should pass custom headers", async () => {
      const app = new Hono();
      app.get("/test", (c) => {
        const customHeader = c.req.header("X-Custom-Header");
        return c.json({header: customHeader});
      });

      const res = await makeRequest(app, "/test", {
        headers: {"X-Custom-Header": "custom-value"},
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as HeaderResponse;
      expect(json.header).toBe("custom-value");
    });
  });

  describe("get", () => {
    it("should make a GET request", async () => {
      const app = new Hono();
      app.get("/users", (c) => c.json({users: []}));

      const res = await get(app, "/users");

      expect(res.status).toBe(200);
      const json = (await res.json()) as UsersResponse;
      expect(json.users).toBeInstanceOf(Array);
    });

    it("should pass headers", async () => {
      const app = new Hono();
      app.get("/test", (c) => {
        const auth = c.req.header("Authorization");
        return c.json({auth});
      });

      const res = await get(app, "/test", {
        headers: {Authorization: "Bearer token"},
      });

      const json = (await res.json()) as AuthResponse;
      expect(json.auth).toBe("Bearer token");
    });
  });

  describe("post", () => {
    it("should make a POST request with JSON body", async () => {
      const app = new Hono();
      app.post("/users", async (c) => {
        const body: {name: string} = await c.req.json();
        return c.json({created: body}, 201);
      });

      const res = await post(app, "/users", {name: "John"});

      expect(res.status).toBe(201);
      const json = (await res.json()) as CreatedResponse;
      expect(json.created.name).toBe("John");
    });

    it("should auto-set Content-Type header", async () => {
      const app = new Hono();
      app.post("/test", (c) => {
        const contentType = c.req.header("Content-Type");
        return c.json({contentType});
      });

      const res = await post(app, "/test", {data: "test"});

      const json = (await res.json()) as ContentTypeResponse;
      expect(json.contentType).toBe("application/json");
    });

    it("should not override existing Content-Type", async () => {
      const app = new Hono();
      app.post("/test", (c) => {
        const contentType = c.req.header("Content-Type");
        return c.json({contentType});
      });

      const res = await post(app, "/test", "plain text", {
        headers: {"Content-Type": "text/plain"},
      });

      const json = (await res.json()) as ContentTypeResponse;
      expect(json.contentType).toBe("text/plain");
    });

    it("should handle undefined body", async () => {
      const app = new Hono();
      app.post("/test", (c) => c.json({success: true}));

      const res = await post(app, "/test");

      expect(res.status).toBe(200);
      const json = (await res.json()) as SuccessResponse;
      expect(json.success).toBe(true);
    });
  });

  describe("put", () => {
    it("should make a PUT request with JSON body", async () => {
      const app = new Hono();
      app.put("/users/:id", async (c) => {
        const body: {name: string} = await c.req.json();
        return c.json({updated: body});
      });

      const res = await put(app, "/users/123", {name: "Jane"});

      expect(res.status).toBe(200);
      const json = (await res.json()) as UpdatedResponse;
      expect(json.updated.name).toBe("Jane");
    });
  });

  describe("patch", () => {
    it("should make a PATCH request with JSON body", async () => {
      const app = new Hono();
      app.patch("/users/:id", async (c) => {
        const body: {name: string} = await c.req.json();
        return c.json({patched: body});
      });

      const res = await patch(app, "/users/123", {name: "Bob"});

      expect(res.status).toBe(200);
      const json = (await res.json()) as PatchedResponse;
      expect(json.patched.name).toBe("Bob");
    });
  });

  describe("del", () => {
    it("should make a DELETE request", async () => {
      const app = new Hono();
      app.delete("/users/:id", (c) => c.json({deleted: true}));

      const res = await del(app, "/users/123");

      expect(res.status).toBe(200);
      const json = (await res.json()) as DeletedResponse;
      expect(json.deleted).toBe(true);
    });

    it("should pass headers", async () => {
      const app = new Hono();
      app.delete("/test", (c) => {
        const auth = c.req.header("Authorization");
        return c.json({auth});
      });

      const res = await del(app, "/test", {
        headers: {Authorization: "Bearer token"},
      });

      const json = (await res.json()) as AuthResponse;
      expect(json.auth).toBe("Bearer token");
    });
  });
});
