/**
 * @ns-dojo/shared-hono-test-utils
 *
 * Testing utilities for Hono applications including request helpers,
 * authenticated request helpers, database mocks, and context mocks.
 */

// Request helpers
export {makeRequest, get, post, put, patch, del} from "./request-helpers.js";

// Auth helpers
export {
  generateTestToken,
  makeAuthenticatedRequest,
  authGet,
  authPost,
  authPut,
  authPatch,
  authDel,
} from "./auth-helpers.js";

// Context mocks
export {mockHonoContext, mockAuthenticatedContext} from "./context-mocks.js";

// Types
export type {
  TestResponse,
  AuthenticatedRequestOptions,
  UserPayload,
  MockContextOptions,
  MockRequest,
  MockContext,
} from "./types.js";
