import type {Env, Hono} from "hono";
import {SignJWT} from "jose";
import {makeRequest} from "./request-helpers.js";
import type {
  AuthenticatedRequestOptions,
  TestResponse,
  UserPayload,
} from "./types.js";

/**
 * Default test JWT secret (matches common test environment setup)
 */
const DEFAULT_TEST_SECRET = "test-jwt-secret-key-for-testing";

/**
 * Generate a test JWT token for authenticated requests
 *
 * @param payload - The user payload to encode in the token
 * @param secret - JWT secret (defaults to test secret)
 * @returns A signed JWT token string
 *
 * @example
 * ```typescript
 * const token = await generateTestToken({
 *   sub: "user-123",
 *   role: "admin",
 *   email: "admin@example.com"
 * });
 * ```
 */
export async function generateTestToken<TRole extends string = string>(
  payload: UserPayload<TRole>,
  secret?: string,
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret ?? DEFAULT_TEST_SECRET);

  const now = Math.floor(Date.now() / 1000);
  const iat = payload.iat ?? now;
  const exp = payload.exp ?? now + 3600; // 1 hour from now

  return new SignJWT({
    user_id: payload.sub,
    role: payload.role,
    email: payload.email,
  })
    .setProtectedHeader({alg: "HS256"})
    .setSubject(payload.sub)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secretKey);
}

/**
 * Make an authenticated HTTP request with a Bearer token
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param options - Authenticated request options (userId, role, method, body, etc.)
 * @returns A typed test response
 *
 * @example
 * ```typescript
 * const res = await makeAuthenticatedRequest<UserProfile>(app, "/api/profile", {
 *   userId: "user-123",
 *   role: "user",
 *   method: "GET"
 * });
 * ```
 */
export async function makeAuthenticatedRequest<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  options: AuthenticatedRequestOptions<TRole>,
): Promise<TestResponse<T>> {
  const {userId, role, email, method = "GET", body, headers = {}} = options;

  // Generate JWT token with user payload
  const token = await generateTestToken({
    sub: userId,
    role,
    email,
  });

  // Prepare request headers
  const requestHeaders: Record<string, string> = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };

  // Add Content-Type for requests with body
  if (body !== undefined && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Make the request
  return makeRequest<T, E>(app, path, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Make an authenticated GET request
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param userId - The user ID for authentication
 * @param role - The user role
 * @param headers - Additional headers
 * @returns A typed test response
 */
export async function authGet<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  userId: string,
  role: TRole = "user" as TRole,
  headers?: Record<string, string>,
): Promise<TestResponse<T>> {
  return makeAuthenticatedRequest<T, TRole, E>(app, path, {
    userId,
    role,
    method: "GET",
    headers,
  });
}

/**
 * Make an authenticated POST request
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param userId - The user ID for authentication
 * @param role - The user role
 * @param body - Request body
 * @param headers - Additional headers
 * @returns A typed test response
 */
export async function authPost<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  userId: string,
  role: TRole = "user" as TRole,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<TestResponse<T>> {
  return makeAuthenticatedRequest<T, TRole, E>(app, path, {
    userId,
    role,
    method: "POST",
    body,
    headers,
  });
}

/**
 * Make an authenticated PUT request
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param userId - The user ID for authentication
 * @param role - The user role
 * @param body - Request body
 * @param headers - Additional headers
 * @returns A typed test response
 */
export async function authPut<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  userId: string,
  role: TRole = "user" as TRole,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<TestResponse<T>> {
  return makeAuthenticatedRequest<T, TRole, E>(app, path, {
    userId,
    role,
    method: "PUT",
    body,
    headers,
  });
}

/**
 * Make an authenticated PATCH request
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param userId - The user ID for authentication
 * @param role - The user role
 * @param body - Request body
 * @param headers - Additional headers
 * @returns A typed test response
 */
export async function authPatch<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  userId: string,
  role: TRole = "user" as TRole,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<TestResponse<T>> {
  return makeAuthenticatedRequest<T, TRole, E>(app, path, {
    userId,
    role,
    method: "PATCH",
    body,
    headers,
  });
}

/**
 * Make an authenticated DELETE request
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param userId - The user ID for authentication
 * @param role - The user role
 * @param headers - Additional headers
 * @returns A typed test response
 */
export async function authDel<
  T = unknown,
  TRole extends string = string,
  E extends Env = Env,
>(
  app: Hono<E>,
  path: string,
  userId: string,
  role: TRole = "user" as TRole,
  headers?: Record<string, string>,
): Promise<TestResponse<T>> {
  return makeAuthenticatedRequest<T, TRole, E>(app, path, {
    userId,
    role,
    method: "DELETE",
    headers,
  });
}
