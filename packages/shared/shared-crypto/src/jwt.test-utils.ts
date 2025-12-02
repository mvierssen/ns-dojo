import {afterEach, beforeEach, vi} from "vitest";

export const TEST_SECRET = "test-secret-key-for-jwt-testing";

export interface TestPayload<TRole extends string> {
  user_id: string;
  role: TRole;
}

export const setupJwtTestEnvironment = () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {...originalEnv};
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  return {originalEnv};
};

export const TEST_PAYLOADS = {
  user: {user_id: "user123", role: "user" as const},
  admin: {user_id: "user456", role: "admin" as const},
  moderator: {user_id: "integration-test-user", role: "moderator" as const},
  e2e: {user_id: "e2e-test-user", role: "user" as const},
};

export const TEST_SECRETS = {
  custom: "custom-secret",
  verification: "custom-verification-secret",
  extractVerify: "custom-extract-verify-secret",
  wrong: "wrong-secret",
};

export const SAMPLE_JWT_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

export const JWT_ERRORS = {
  noSecret: {
    message: "JWT secret not configured",
    statusCode: 500,
  },
  invalidToken: {
    message: "Invalid token",
    statusCode: 401,
    code: "INVALID_TOKEN",
  },
  noToken: {
    message: "No token provided",
    statusCode: 401,
    code: "NO_TOKEN",
  },
};

export const USER_ROLES: string[] = ["user", "admin", "moderator"];

export const INVALID_AUTH_HEADERS = [
  "Basic dXNlcjpwYXNz",
  "Token abc123",
  "bearer token123", // wrong case
];

export const MALFORMED_TOKENS = [
  "not-a-jwt",
  "missing.second.part.",
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9", // missing signature
  "", // empty string
];
