import {describe, expect, it} from "vitest";
import {createApp} from "../src/app.js";

describe("App", () => {
  const app = createApp();

  it("should return API info at root", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      name: string;
      version: string;
      endpoints: unknown;
    };
    expect(json).toMatchObject({
      name: "template-backend-hono",
      version: "1.0.0",
    });
    expect(json.endpoints).toBeDefined();
  });

  it("should return 404 for unknown routes", async () => {
    const res = await app.request("/unknown-route");
    expect(res.status).toBe(404);

    const json = (await res.json()) as {
      title: string;
      status: number;
    };
    expect(json).toMatchObject({
      title: "Not Found",
      status: 404,
    });
  });

  it("should handle CORS preflight requests", async () => {
    const res = await app.request("/api/v1/items", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "GET",
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should set security headers", async () => {
    const res = await app.request("/");

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBeDefined();
  });

  it("should generate request ID", async () => {
    const res = await app.request("/");

    const requestId = res.headers.get("X-Request-ID");
    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe("string");
  });
});
