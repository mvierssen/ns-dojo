import {Hono} from "hono";
import {beforeEach, describe, expect, it} from "vitest";
import {
  csrfProtection,
  csrfTokenGenerator,
  getCsrfTokenHandler,
} from "./csrf.js";

interface CsrfEnv {
  Variables: {
    csrfToken?: string;
  };
}

describe("CSRF Middleware for Hono", () => {
  let app: Hono<CsrfEnv>;

  beforeEach(() => {
    app = new Hono<CsrfEnv>();
    process.env.CSRF_SECRET =
      "test-secret-key-for-hmac-signing-minimum-32-chars";
  });

  describe("csrfTokenGenerator", () => {
    it("should generate and set CSRF token in cookie", async () => {
      app.use("/*", csrfTokenGenerator());
      app.get("/test", (c) => c.json({token: c.get("csrfToken")}));

      const res = await app.request("/test");
      expect(res.status).toBe(200);

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("__csrf=");
      expect(setCookie).toContain("HttpOnly=false");
      expect(setCookie).toContain("SameSite=Lax");

      const json = (await res.json()) as {token: string};
      expect(json.token).toBeTruthy();
      expect(json.token.length).toBeGreaterThan(20);
    });

    it("should set token in context variable", async () => {
      app.use("/*", csrfTokenGenerator());
      app.get("/token", (c) => c.json({csrfToken: c.get("csrfToken")}));

      const res = await app.request("/token");
      const json = (await res.json()) as {csrfToken: string};

      expect(json.csrfToken).toBeTruthy();
    });

    it("should use custom configuration", async () => {
      app.use(
        "/*",
        csrfTokenGenerator({
          secret: "custom-secret-minimum-32-characters-long",
          cookieName: "my-csrf-token",
          headerName: "x-my-csrf",
          tokenLength: 16,
        }),
      );
      app.get("/test", (c) => c.text("ok"));

      const res = await app.request("/test");
      const setCookie = res.headers.get("set-cookie");

      expect(setCookie).toContain("my-csrf-token=");
    });
  });

  describe("csrfProtection", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development"; // Ensure not test mode
    });

    it("should allow GET requests without token", async () => {
      app.use("/*", csrfProtection());
      app.get("/test", (c) => c.json({success: true}));

      const res = await app.request("/test");
      expect(res.status).toBe(200);
    });

    it("should block POST requests without CSRF token", async () => {
      app.use("/*", csrfProtection());
      app.post("/test", (c) => c.json({success: true}));

      const res = await app.request("/test", {method: "POST"});
      expect(res.status).toBe(403);

      const json = (await res.json()) as Record<string, unknown>;
      expect(json).toMatchObject({
        status: 403,
        title: "CSRF Token Missing",
      });
    });

    it("should validate CSRF token for POST requests", async () => {
      // First, generate a token
      app.use("/*", csrfTokenGenerator());
      app.get("/get-token", (c) => c.json({token: c.get("csrfToken")}));

      const tokenRes = await app.request("/get-token");
      const {token} = (await tokenRes.json()) as {token: string};
      const cookie = tokenRes.headers.get("set-cookie") ?? "";

      // Now, make POST request with token
      const postApp = new Hono();
      postApp.use("/*", csrfProtection());
      postApp.post("/test", (c) => c.json({success: true}));

      const res = await postApp.request("/test", {
        method: "POST",
        headers: {
          "x-csrf-token": token,
          cookie,
        },
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as Record<string, unknown>;
      expect(json).toEqual({success: true});
    });

    it("should skip validation in test environment", async () => {
      process.env.NODE_ENV = "test";

      app.use("/*", csrfProtection());
      app.post("/test", (c) => c.json({success: true}));

      const res = await app.request("/test", {method: "POST"});
      expect(res.status).toBe(200);
    });

    it("should reject requests with missing cookie", async () => {
      process.env.NODE_ENV = "development";

      app.use("/*", csrfProtection());
      app.post("/test", (c) => c.json({success: true}));

      const res = await app.request("/test", {
        method: "POST",
        headers: {
          "x-csrf-token": "some-token",
        },
      });

      expect(res.status).toBe(403);
      const json = (await res.json()) as Record<string, unknown>;
      expect(json).toMatchObject({
        status: 403,
        title: "CSRF Cookie Missing",
      });
    });

    it("should reject requests with invalid token", async () => {
      process.env.NODE_ENV = "development";

      app.use("/*", csrfProtection());
      app.post("/test", (c) => c.json({success: true}));

      const res = await app.request("/test", {
        method: "POST",
        headers: {
          "x-csrf-token": "invalid-token",
          cookie: "__csrf=invalid-cookie-token",
        },
      });

      expect(res.status).toBe(403);
      const json = (await res.json()) as Record<string, unknown>;
      expect(json).toMatchObject({
        status: 403,
        title: "CSRF Tokens Mismatch",
      });
    });

    it("should allow OPTIONS requests without token", async () => {
      app.use("/*", csrfProtection());
      app.all("/test", (c) => c.text("ok"));

      const res = await app.request("/test", {method: "OPTIONS"});
      expect(res.status).toBe(200);
    });
  });

  describe("getCsrfTokenHandler", () => {
    it("should return CSRF token from context", async () => {
      app.use("/*", csrfTokenGenerator());
      app.get("/csrf-token", getCsrfTokenHandler);

      const res = await app.request("/csrf-token");
      expect(res.status).toBe(200);

      const json = (await res.json()) as {csrfToken: string};
      expect(json.csrfToken).toBeTruthy();
    });

    it("should return 500 if token not generated", async () => {
      app.get("/csrf-token", getCsrfTokenHandler);

      const res = await app.request("/csrf-token");
      expect(res.status).toBe(500);

      const json = (await res.json()) as Record<string, unknown>;
      expect(json).toMatchObject({
        status: 500,
        title: "CSRF Token Not Available",
      });
    });
  });
});
