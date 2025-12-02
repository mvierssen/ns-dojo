import {Hono} from "hono";
import {describe, expect, it} from "vitest";
import {z} from "zod";
import {
  badRequest,
  createProblemDetails,
  forbidden,
  internalError,
  mapZodErrors,
  notFound,
  unauthorized,
} from "../src/errors.js";

describe("Error Utilities", () => {
  it("should create problem details with correct structure", () => {
    const problem = createProblemDetails(
      404,
      "Not Found",
      "Resource does not exist",
    );

    expect(problem).toEqual({
      type: "https://httpstatuses.com/404",
      title: "Not Found",
      status: 404,
      detail: "Resource does not exist",
    });
  });

  it("should map Zod errors correctly", () => {
    const schema = z.object({
      email: z.email(),
      age: z.number().min(18),
    });

    const result = schema.safeParse({
      email: "invalid",
      age: 15,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issues = mapZodErrors(result.error);

      expect(issues).toHaveLength(2);
      expect(issues?.[0]).toMatchObject({
        path: ["email"],
        code: "invalid_format",
      });
      expect(issues?.[1]).toMatchObject({
        path: ["age"],
        code: "too_small",
      });
    }
  });

  it("should create badRequest response with Zod errors", async () => {
    const app = new Hono();
    const schema = z.object({email: z.email()});

    app.get("/test", (c) => {
      const result = schema.safeParse({email: "invalid"});
      if (!result.success) {
        return badRequest(c, result.error);
      }
      return c.json({ok: true});
    });

    const res = await app.request("/test");
    expect(res.status).toBe(400);

    const json = (await res.json()) as {
      type: string;
      title: string;
      status: number;
      instance: string;
      issues?: unknown[];
    };
    expect(json).toMatchObject({
      type: "about:blank#bad-request",
      title: "Bad Request",
      status: 400,
      instance: "/test",
    });
    expect(json.issues).toBeDefined();
    expect(json.issues).toHaveLength(1);
  });

  it("should create unauthorized response", async () => {
    const app = new Hono();

    app.get("/test", (c) => unauthorized(c));

    const res = await app.request("/test");
    expect(res.status).toBe(401);

    const json = (await res.json()) as {
      type: string;
      title: string;
      status: number;
    };
    expect(json).toMatchObject({
      type: "about:blank#unauthorized",
      title: "Unauthorized",
      status: 401,
    });
  });

  it("should create forbidden response", async () => {
    const app = new Hono();

    app.get("/test", (c) => forbidden(c, "Admin access required"));

    const res = await app.request("/test");
    expect(res.status).toBe(403);

    const json = (await res.json()) as {detail: string; status: number};
    expect(json).toMatchObject({
      detail: "Admin access required",
      status: 403,
    });
  });

  it("should create notFound response", async () => {
    const app = new Hono();

    app.get("/test", (c) => notFound(c));

    const res = await app.request("/test");
    expect(res.status).toBe(404);

    const json = (await res.json()) as {status: number};
    expect(json.status).toBe(404);
  });

  it("should create internalError response", async () => {
    const app = new Hono();

    app.get("/test", (c) => internalError(c));

    const res = await app.request("/test");
    expect(res.status).toBe(500);

    const json = (await res.json()) as {status: number};
    expect(json.status).toBe(500);
  });
});
