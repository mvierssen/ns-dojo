import {vi} from "vitest";
import type {MockContext, MockContextOptions, MockRequest} from "./types.js";

/**
 * Create a mock Hono request object for unit testing
 *
 * @param options - Options for the mock request
 * @returns A mock request object
 */
function createMockRequest(options: MockContextOptions): MockRequest {
  const {path = "/", method = "GET", headers = {}, body = null} = options;

  const url = `http://localhost${path}`;

  return {
    url,
    method,
    header: vi.fn(
      (name: string): string | undefined => headers[name.toLowerCase()],
    ),
    parseBody: vi.fn((): Promise<unknown> => Promise.resolve(body)),
    json: vi.fn((): Promise<unknown> => Promise.resolve(body)),
    text: vi.fn(
      (): Promise<string> =>
        Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
    ),
    arrayBuffer: vi.fn(
      (): Promise<ArrayBuffer> => Promise.resolve(new ArrayBuffer(0)),
    ),
  };
}

/**
 * Create a mock Hono context for unit testing middleware
 *
 * @param options - Options for the mock context
 * @returns A mock Hono context object
 *
 * @example
 * ```typescript
 * const mockCtx = mockHonoContext({
 *   path: "/api/users",
 *   method: "POST",
 *   headers: { "content-type": "application/json" },
 *   body: { email: "test@example.com" },
 *   variables: { userId: "user-123" }
 * });
 *
 * // Test middleware
 * await myMiddleware(mockCtx, async () => {});
 *
 * // Assert context methods were called
 * expect(mockCtx.json).toHaveBeenCalledWith({ success: true }, 200);
 * ```
 */
export function mockHonoContext<Variables = Record<string, unknown>>(
  options: MockContextOptions<Variables> = {},
): MockContext<Variables> {
  const {variables = {} as Partial<Variables>} = options;

  // Create variable storage
  const variableStore = new Map<string, unknown>(
    Object.entries(variables as Record<string, unknown>),
  );

  // Create mock request
  const req = createMockRequest(options);

  // Create mock context
  const mockCtx: MockContext<Variables> = {
    req,
    get: vi.fn((key: string): unknown => variableStore.get(key)),
    set: vi.fn((key: string, value: unknown): void => {
      variableStore.set(key, value);
    }),
    json: vi.fn((data: unknown, status = 200): Response => {
      return Response.json(data, {status: status as number});
    }),
    text: vi.fn((text: string, status = 200): Response => {
      const init: ResponseInit = {
        status: status as number,
        headers: {"Content-Type": "text/plain"},
      };
      return new Response(text, init);
    }),
    header: vi.fn(),
    status: vi.fn(),
    redirect: vi.fn(),
    var: variables as Variables,
  };

  return mockCtx;
}

/**
 * Create a mock authenticated Hono context
 *
 * @param userId - The user ID to set in context
 * @param role - The user role
 * @param options - Additional context options
 * @returns A mock Hono context with user authentication set
 *
 * @example
 * ```typescript
 * const mockCtx = mockAuthenticatedContext("user-123", "admin", {
 *   path: "/api/protected",
 *   method: "GET"
 * });
 *
 * // Context has userId and jwtPayload already set
 * expect(mockCtx.get("userId")).toBe("user-123");
 * expect(mockCtx.get("jwtPayload")).toEqual({
 *   sub: "user-123",
 *   role: "admin"
 * });
 * ```
 */
export function mockAuthenticatedContext<
  Variables = Record<string, unknown>,
  TRole extends string = string,
>(
  userId: string,
  role: TRole = "user" as TRole,
  options: MockContextOptions<Variables> = {},
): MockContext<Variables> {
  const now = Math.floor(Date.now() / 1000);

  const authVariables = {
    userId,
    jwtPayload: {
      sub: userId,
      role,
      iat: now,
      exp: now + 3600,
    },
    ...options.variables,
  };

  return mockHonoContext({
    ...options,
    variables: authVariables as unknown as Partial<Variables>,
  });
}
