import type {Mock} from "vitest";

/**
 * Type-safe test response wrapper
 */
export interface TestResponse<T = unknown> {
  status: number;
  headers: Headers;
  json: () => Promise<T>;
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

/**
 * Options for authenticated requests
 */
export interface AuthenticatedRequestOptions<TRole extends string = string> {
  method?: string;
  body?: unknown;
  userId: string;
  role: TRole;
  email?: string;
  headers?: Record<string, string>;
}

/**
 * JWT payload for test tokens
 */
export interface UserPayload<TRole extends string = string> {
  sub: string;
  role: TRole;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Options for creating mock Hono context
 */
export interface MockContextOptions<Variables = Record<string, unknown>> {
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  variables?: Partial<Variables>;
}

/**
 * Mock Hono request interface
 */
export interface MockRequest {
  url: string;
  method: string;
  header: Mock;
  parseBody: Mock;
  json: Mock;
  text: Mock;
  arrayBuffer: Mock;
}

/**
 * Mock Hono context interface
 */
export interface MockContext<Variables = Record<string, unknown>> {
  req: MockRequest;
  get: Mock;
  set: Mock;
  json: Mock;
  text: Mock;
  header: Mock;
  status: Mock;
  redirect: Mock;
  var: Variables;
}
