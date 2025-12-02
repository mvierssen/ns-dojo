import type {Env, Hono} from "hono";
import type {TestResponse} from "./types.js";

/**
 * Make an HTTP request to a Hono app instance
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path (e.g., "/api/users")
 * @param options - Request options (method, body, headers)
 * @returns A typed test response
 *
 * @example
 * ```typescript
 * const res = await makeRequest(app, "/api/users");
 * const json = await res.json() as UsersResponse;
 * expect(res.status).toBe(200);
 * ```
 */
export async function makeRequest<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  options?: RequestInit,
): Promise<TestResponse<T>> {
  const req = new Request(`http://localhost${path}`, options);
  return app.fetch(req) as Promise<TestResponse<T>>;
}

/**
 * Make a GET request to a Hono app
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param options - Request options (headers, etc.)
 * @returns A typed test response
 *
 * @example
 * ```typescript
 * const res = await get<User>(app, "/api/users/123");
 * const user = await res.json();
 * ```
 */
export async function get<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  options?: Omit<RequestInit, "method">,
): Promise<TestResponse<T>> {
  return makeRequest<T, E>(app, path, {...options, method: "GET"});
}

/**
 * Make a POST request to a Hono app
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param body - Request body (will be JSON stringified)
 * @param options - Additional request options
 * @returns A typed test response
 *
 * @example
 * ```typescript
 * const res = await post<CreateUserResponse>(app, "/api/users", {
 *   email: "test@example.com",
 *   password: "password123"
 * });
 * ```
 */
export async function post<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  body?: unknown,
  options?: Omit<RequestInit, "method" | "body">,
): Promise<TestResponse<T>> {
  const headers = new Headers(options?.headers);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return makeRequest<T, E>(app, path, {
    ...options,
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Make a PUT request to a Hono app
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param body - Request body (will be JSON stringified)
 * @param options - Additional request options
 * @returns A typed test response
 */
export async function put<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  body?: unknown,
  options?: Omit<RequestInit, "method" | "body">,
): Promise<TestResponse<T>> {
  const headers = new Headers(options?.headers);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return makeRequest<T, E>(app, path, {
    ...options,
    method: "PUT",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Make a PATCH request to a Hono app
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param body - Request body (will be JSON stringified)
 * @param options - Additional request options
 * @returns A typed test response
 */
export async function patch<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  body?: unknown,
  options?: Omit<RequestInit, "method" | "body">,
): Promise<TestResponse<T>> {
  const headers = new Headers(options?.headers);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return makeRequest<T, E>(app, path, {
    ...options,
    method: "PATCH",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Make a DELETE request to a Hono app
 *
 * @param app - The Hono app instance to test (works with Hono, OpenAPIHono, etc.)
 * @param path - The request path
 * @param options - Request options
 * @returns A typed test response
 */
export async function del<T = unknown, E extends Env = Env>(
  app: Hono<E>,
  path: string,
  options?: Omit<RequestInit, "method">,
): Promise<TestResponse<T>> {
  return makeRequest<T, E>(app, path, {...options, method: "DELETE"});
}
