import {generateToken} from "@ns-dojo/shared-crypto";
import {Hono, type Context} from "hono";
import {beforeEach, describe, expect, it} from "vitest";
import {
  authMiddleware,
  getUser,
  optionalAuthMiddleware,
  requireRole,
} from "./auth.js";
import type {AuthVariables, UserPayload} from "./types.js";

const TEST_SECRET = "test-secret-key-for-jwt-validation-min-32-chars";

describe("authMiddleware", () => {
  let app: Hono<{Variables: AuthVariables}>;

  beforeEach(() => {
    app = new Hono<{Variables: AuthVariables}>();
  });

  it("should authenticate valid JWT token", async () => {
    const token = await generateToken("user-123", "user", {
      secret: TEST_SECRET,
    });

    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => {
      const user = c.get("user");
      return c.json({id: user.id, role: user.role});
    });

    const res = await app.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      id: string;
      role: string;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.id).toBe("user-123");
    expect(json.role).toBe("user");
  });

  it("should reject request without token", async () => {
    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => c.json({success: true}));

    const res = await app.request("/protected");

    expect(res.status).toBe(401);

    interface ErrorResponse {
      type: string;
      title: string;
      status: number;
    }
    const json = (await res.json()) as ErrorResponse;
    expect(json.type).toContain("unauthorized");
    expect(json.status).toBe(401);
  });

  it("should reject invalid token format", async () => {
    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => c.json({success: true}));

    const res = await app.request("/protected", {
      headers: {Authorization: "Bearer invalid-token"},
    });

    expect(res.status).toBe(401);
  });

  it("should reject expired token", async () => {
    const token = await generateToken("user-123", "user", {
      secret: TEST_SECRET,
      expiresIn: "0s",
    });

    // Wait a bit to ensure token is expired
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => c.json({success: true}));

    const res = await app.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(401);

    interface ErrorResponse {
      title: string;
    }
    const json = (await res.json()) as ErrorResponse;
    // Note: shared-crypto converts all jose errors (including JWTExpired) to "Invalid token"
    expect(json.title).toBe("Invalid token");
  });

  it("should attach user to context", async () => {
    const token = await generateToken("user-456", "admin", {
      secret: TEST_SECRET,
    });

    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => {
      const user = c.get("user");
      expect(user).toBeDefined();
      expect(user.id).toBe("user-456");
      expect(user.role).toBe("admin");
      return c.json({success: true});
    });

    const res = await app.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);
  });

  it("should support generic role types", async () => {
    type UserRole = "admin" | "moderator" | "user";

    const token = await generateToken("user-789", "moderator", {
      secret: TEST_SECRET,
    });

    const typedApp = new Hono<{Variables: AuthVariables<UserRole>}>();
    typedApp.use("/protected", authMiddleware<UserRole>({secret: TEST_SECRET}));
    typedApp.get("/protected", (c) => {
      const user = c.get("user");
      const role: UserRole = user.role;
      return c.json({role});
    });

    const res = await typedApp.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      role: UserRole;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.role).toBe("moderator");
  });
});

describe("optionalAuthMiddleware", () => {
  let app: Hono<{Variables: {user?: UserPayload}}>;

  beforeEach(() => {
    app = new Hono<{Variables: {user?: UserPayload}}>();
  });

  it("should allow requests without token", async () => {
    app.use("/public", optionalAuthMiddleware({secret: TEST_SECRET}));
    app.get("/public", (c) => {
      const user = c.get("user");
      return c.json({authenticated: Boolean(user)});
    });

    const res = await app.request("/public");

    expect(res.status).toBe(200);

    interface ResponseBody {
      authenticated: boolean;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.authenticated).toBe(false);
  });

  it("should set user if valid token provided", async () => {
    const token = await generateToken("user-123", "user", {
      secret: TEST_SECRET,
    });

    app.use("/public", optionalAuthMiddleware({secret: TEST_SECRET}));
    app.get("/public", (c) => {
      const user = c.get("user");
      return c.json({
        authenticated: Boolean(user),
        userId: user?.id,
      });
    });

    const res = await app.request("/public", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      authenticated: boolean;
      userId?: string;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.authenticated).toBe(true);
    expect(json.userId).toBe("user-123");
  });

  it("should continue without auth if invalid token", async () => {
    app.use("/public", optionalAuthMiddleware({secret: TEST_SECRET}));
    app.get("/public", (c) => {
      const user = c.get("user");
      return c.json({authenticated: Boolean(user)});
    });

    const res = await app.request("/public", {
      headers: {Authorization: "Bearer invalid-token"},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      authenticated: boolean;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.authenticated).toBe(false);
  });

  it("should continue without auth if expired token", async () => {
    const token = await generateToken("user-123", "user", {
      secret: TEST_SECRET,
      expiresIn: "0s",
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    app.use("/public", optionalAuthMiddleware({secret: TEST_SECRET}));
    app.get("/public", (c) => {
      const user = c.get("user");
      return c.json({authenticated: Boolean(user)});
    });

    const res = await app.request("/public", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      authenticated: boolean;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.authenticated).toBe(false);
  });
});

describe("requireRole", () => {
  type UserRole = "admin" | "moderator" | "user";
  let app: Hono<{Variables: AuthVariables<UserRole>}>;

  beforeEach(() => {
    app = new Hono<{Variables: AuthVariables<UserRole>}>();
  });

  it("should allow matching role", async () => {
    const token = await generateToken("user-123", "admin", {
      secret: TEST_SECRET,
    });

    app.use("/admin", authMiddleware<UserRole>({secret: TEST_SECRET}));
    app.use("/admin", requireRole<UserRole>("admin", "moderator"));
    app.get("/admin", (c) => c.json({success: true}));

    const res = await app.request("/admin", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);
  });

  it("should allow any of the specified roles", async () => {
    const token = await generateToken("user-456", "moderator", {
      secret: TEST_SECRET,
    });

    app.use("/admin", authMiddleware<UserRole>({secret: TEST_SECRET}));
    app.use("/admin", requireRole<UserRole>("admin", "moderator"));
    app.get("/admin", (c) => c.json({success: true}));

    const res = await app.request("/admin", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);
  });

  it("should block non-matching role", async () => {
    const token = await generateToken("user-789", "user", {
      secret: TEST_SECRET,
    });

    app.use("/admin", authMiddleware<UserRole>({secret: TEST_SECRET}));
    app.use("/admin", requireRole<UserRole>("admin", "moderator"));
    app.get("/admin", (c) => c.json({success: true}));

    const res = await app.request("/admin", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(403);

    interface ErrorResponse {
      type: string;
      title: string;
      status: number;
    }
    const json = (await res.json()) as ErrorResponse;
    expect(json.type).toContain("forbidden");
    expect(json.title).toBe("Insufficient permissions");
    expect(json.status).toBe(403);
  });

  it("should return 401 if used without authMiddleware", async () => {
    app.use("/admin", requireRole<UserRole>("admin"));
    app.get("/admin", (c) => c.json({success: true}));

    const res = await app.request("/admin");

    expect(res.status).toBe(401);

    interface ErrorResponse {
      title: string;
    }
    const json = (await res.json()) as ErrorResponse;
    expect(json.title).toBe("Authentication required");
  });
});

describe("getUser", () => {
  let app: Hono<{Variables: AuthVariables}>;

  beforeEach(() => {
    app = new Hono<{Variables: AuthVariables}>();
  });

  it("should extract user from context", async () => {
    const token = await generateToken("user-123", "admin", {
      secret: TEST_SECRET,
    });

    app.use("/protected", authMiddleware({secret: TEST_SECRET}));
    app.get("/protected", (c) => {
      const user = getUser(c);
      return c.json({id: user.id, role: user.role});
    });

    const res = await app.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);

    interface ResponseBody {
      id: string;
      role: string;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.id).toBe("user-123");
    expect(json.role).toBe("admin");
  });

  it("should return user from context", () => {
    const mockUser: UserPayload = {
      id: "user-123",
      role: "admin",
    };

    const mockContext = {
      get: () => mockUser,
      req: {},
    } as unknown as Context<{Variables: AuthVariables}>;

    const user = getUser(mockContext);
    expect(user.id).toBe("user-123");
    expect(user.role).toBe("admin");
  });
});

describe("Type safety", () => {
  it("should infer correct role types", async () => {
    type UserRole = "admin" | "moderator" | "user";

    const app = new Hono<{Variables: AuthVariables<UserRole>}>();
    const token = await generateToken("user-123", "admin", {
      secret: TEST_SECRET,
    });

    app.use("/protected", authMiddleware<UserRole>({secret: TEST_SECRET}));
    app.get("/protected", (c) => {
      const user = c.get("user");

      // Type checking - this should compile
      const role: UserRole = user.role;
      const validRoles: UserRole[] = ["admin", "moderator", "user"];

      return c.json({role, validRoles});
    });

    const res = await app.request("/protected", {
      headers: {Authorization: `Bearer ${token}`},
    });

    expect(res.status).toBe(200);
  });

  it("should support optional user in optionalAuthMiddleware", async () => {
    type UserRole = "admin" | "user";

    const app = new Hono<{Variables: {user?: UserPayload<UserRole>}}>();

    app.use("/public", optionalAuthMiddleware<UserRole>({secret: TEST_SECRET}));
    app.get("/public", (c) => {
      const user = c.get("user");

      if (user) {
        const role: UserRole = user.role;
        return c.json({authenticated: true, role});
      }

      return c.json({authenticated: false});
    });

    const res = await app.request("/public");

    expect(res.status).toBe(200);

    interface ResponseBody {
      authenticated: boolean;
      role?: UserRole;
    }
    const json = (await res.json()) as ResponseBody;
    expect(json.authenticated).toBe(false);
  });
});
